import crypto from 'crypto'
import { v4 as uuid } from 'uuid'

import { viewerName, viewerVersion, viewerPlatform } from '../viewerInfo'
import { getValueOf, getStringValueOf } from '../network/msgGetters'

import { saveAvatar, saveGrid } from './viewerAccount'
import { getLocalChatHistory, loadIMChats } from './chatMessageActions'
import { getAllFriendsDisplayNames } from './friendsActions'
import { fetchSeedCapabilities } from './llsd'
import connectCircuit from './connectCircuit'

// Actions for the session of an avatar

// Logon the user. It will post using fetch to the server.
export function login (avatarName, password, grid, save, addAvatar) {
  return async (dispatch, getState, extra) => {
    if (getState().session.get('loggedIn')) throw new Error('There is already an avatar logged in!')

    const avatarIdentifier = `${avatarName.getFullName()}@${grid.name}`

    dispatch({
      type: 'startLogin',
      name: avatarName,
      grid,
      avatarIdentifier,
      sync: save
    })

    const hash = crypto.createHash('md5')
    hash.update(password, 'ascii')
    const finalPassword = '$1$' + hash.digest('hex')

    const loginData = {
      grid,
      first: avatarName.first,
      last: avatarName.last,
      passwd: finalPassword,
      start: 'last',
      channel: viewerName,
      version: viewerVersion,
      platform: viewerPlatform,
      // mac will be added on the server side
      options: [
        'buddy-list'
      ],
      agree_to_tos: 'true',
      read_critical: 'true'
    }

    const circuit = import('../network/circuit')

    const response = await window.fetch('/hoodie/andromeda-viewer/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const body = await response.json()

    if (body.login !== 'true') {
      dispatch({ type: 'loginDidFail' })
      throw new Error(body.message)
    }

    // save grid if it is new (do not save if login did fail)
    const gridExists = getState().account.get('savedGrids').some(savedGrid => {
      return savedGrid.get('name') === grid.name
    })
    if (save && addAvatar && !gridExists) {
      await dispatch(saveGrid(grid))
    }

    // Set the active circuit and connect to sim
    dispatch(connectToSim(body, await circuit))

    const avatarData = save && addAvatar
      ? await dispatch(saveAvatar(avatarName, grid.name)) // adding new avatars
      : getState().account.get('savedAvatars').reduce((last, avatar) => { // for saved avatars
        if (last != null) return last

        if (avatar.get('avatarIdentifier') === avatarIdentifier) {
          return avatar.toJS()
        } else {
          return last
        }
      }, null)

    const localChatHistory = !addAvatar && save
      ? await dispatch(getLocalChatHistory(avatarData.dataSaveId))
      : []

    dispatch({
      type: 'didLogin',
      name: avatarName,
      avatarIdentifier: avatarData != null ? avatarData.avatarIdentifier : avatarIdentifier,
      dataSaveId: avatarData != null ? avatarData.dataSaveId : uuid(),
      grid,
      uuid: body.agent_id,
      buddyList: body['buddy-list'],
      sessionInfo: body,
      localChatHistory
    })

    dispatch(loadIMChats())
    dispatch(fetchSeedCapabilities(body['seed_capability']))
      .then(() => dispatch(getAllFriendsDisplayNames()))

    return body
  }
}

// Placeholder for the logout process
export function logout () {
  return (dispatch, getState, extra) => {
    const circuit = extra.circuit
    const session = getState().session
    if (!session.get('loggedIn')) {
      throw new Error("You aren't logged in!")
    }

    circuit.send('LogoutRequest', {
      AgentData: [
        {
          AgentID: session.get('agentId'),
          SessionID: session.get('sessionId')
        }
      ]
    }, true)

    dispatch({
      type: 'StartLogout'
    })

    circuit.once('LogoutReply', msg => {
      dispatch({
        type: 'DidLogout'
      })

      circuit.close()
      circuit.removeAllListeners()
      extra.circuit = null
    })
  }
}

// Login to a sim. Is called on the login process and sim-change
function connectToSim (sessionInfo, circuit) {
  return async (dispatch, getState, extraArgs) => {
    const Circuit = circuit.default
    const circuitCode = sessionInfo.circuit_code
    const activeCircuit = new Circuit(sessionInfo.sim_ip, sessionInfo.sim_port, circuitCode)
    extraArgs.circuit = activeCircuit

    dispatch(connectCircuit()) // Connect message parsing with circuit.

    activeCircuit.on('KickUser', msg => dispatch(getKicked(msg)))

    await activeCircuit.send('UseCircuitCode', {
      CircuitCode: [
        {
          Code: circuitCode,
          SessionID: sessionInfo.session_id,
          ID: sessionInfo.agent_id
        }
      ]
    }, true)

    await activeCircuit.send('CompleteAgentMovement', {
      AgentData: [
        {
          AgentID: sessionInfo.agent_id,
          SessionID: sessionInfo.session_id,
          CircuitCode: circuitCode
        }
      ]
    }, true)

    await activeCircuit.send('AgentUpdate', {
      AgentData: [
        {
          AgentID: sessionInfo.agent_id,
          SessionID: sessionInfo.session_id,
          BodyRotation: [0, 0, 0],
          HeadRotation: [0, 0, 0],
          State: 0,
          CameraCenter: [0, 0, 0],
          CameraAtAxis: [0, 0, 0],
          CameraLeftAxis: [0, 0, 0],
          CameraUpAxis: [0, 0, 0],
          Far: 0,
          ControlFlags: 0,
          Flags: 0
        }
      ]
    }, true)

    activeCircuit.send('UUIDNameRequest', {
      UUIDNameBlock: [
        {
          ID: sessionInfo.agent_id
        }
      ]
    }, true)

    setTimeout(function () {
      activeCircuit.send('RequestRegionInfo', {
        AgentData: [
          {
            AgentID: sessionInfo.agent_id,
            SessionID: sessionInfo.session_id
          }
        ]
      }, true)
    }, 100)
  }
}

function getKicked (msg) {
  return (dispatch, getState, extra) => {
    const circuit = extra.circuit
    const session = getState().session
    const agentId = session.get('agentId')
    const sessionId = session.get('sessionId')
    const msgAgentId = getValueOf(msg, 'UserInfo', 0, 'AgentID')
    const msgSessionId = getValueOf(msg, 'UserInfo', 0, 'SessionID')

    if (agentId === msgAgentId && sessionId === msgSessionId) {
      circuit.close()
      circuit.removeAllListeners()
      extra.circuit = null

      dispatch({
        type: 'UserWasKicked',
        reason: getStringValueOf(msg, 'UserInfo', 0, 'Reason')
      })
    }
  }
}
