import crypto from 'crypto'
import { v4 as uuid } from 'uuid'

import { viewerName, viewerVersion, viewerPlatform } from '../viewerInfo'
import { getValueOf, getStringValueOf } from '../network/msgGetters'

import { saveAvatar, saveGrid } from './viewerAccount'
import { getLocalChatHistory, loadIMChats, deleteOldLocalChat } from './chatMessageActions'
import { getAllFriendsDisplayNames } from './friendsActions'
import { fetchSeedCapabilities } from './llsd'
import connectCircuit from './connectCircuit'

import { getSavedAvatars, getSavedGrids } from '../selectors/viewer'
import { getIsLoggedIn, getAgentId, getSessionId } from '../selectors/session'

// Actions for the session of an avatar

// Logon the user. It will post using fetch to the server.
export function login (avatarName, password, grid, save, isNew) {
  return async (dispatch, getState, extra) => {
    if (getIsLoggedIn(getState())) throw new Error('There is already an avatar logged in!')

    dispatch({
      type: 'startLogin',
      name: avatarName,
      grid,
      sync: save
    })

    const hash = crypto.createHash('md5')
    hash.update(password, 'ascii')
    const finalPassword = '$1$' + hash.digest('hex')

    const viewerData = {
      grid
    }

    if (save) {
      const userId = await extra.hoodie.account.get('id')
      viewerData.userId = userId
    }

    const loginData = {
      viewerData,
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
    const gridExists = getSavedGrids(getState()).some(savedGrid => savedGrid.name === grid.name)
    if (save && isNew && !gridExists) {
      await dispatch(saveGrid(grid))
    }

    const avatarIdentifier = `${body.agent_id}@${grid.name}`

    const avatarData = save && isNew
      ? await dispatch(saveAvatar(avatarName, body.agent_id, grid.name)) // adding new avatars
      : getSavedAvatars(getState()).reduce((last, avatar) => { // for saved avatars
        if (last != null) return last

        return avatar.avatarIdentifier === avatarIdentifier
          ? avatar
          : last
      }, null)

    const localChatHistory = !isNew && save
      ? await dispatch(getLocalChatHistory(avatarData.dataSaveId))
      : []

    dispatch({
      type: 'didLogin',
      name: avatarName,
      save,
      avatarIdentifier: avatarData != null ? avatarData.avatarIdentifier : avatarIdentifier,
      dataSaveId: avatarData != null ? avatarData.dataSaveId : uuid(),
      grid,
      uuid: body.agent_id,
      buddyList: body['buddy-list'],
      sessionInfo: body,
      localChatHistory
    })

    dispatch(loadIMChats())

    // Set the active circuit and connect to sim
    dispatch(connectToSim(body, await circuit))

    dispatch(fetchSeedCapabilities(body['seed_capability']))
      .then(() => dispatch(getAllFriendsDisplayNames()))

    return body
  }
}

// Logout an avatar
export function logout () {
  return (dispatch, getState, extra) => {
    const circuit = extra.circuit
    const activeState = getState()

    if (!getIsLoggedIn(activeState)) {
      return Promise.reject(new Error("You aren't logged in!"))
    }

    return new Promise((resolve, reject) => {
      circuit.send('LogoutRequest', {
        AgentData: [
          {
            AgentID: getAgentId(activeState),
            SessionID: getSessionId(activeState)
          }
        ]
      }, true)
        .catch(reject)

      dispatch({
        type: 'StartLogout'
      })

      circuit.once('LogoutReply', msg => {
        dispatch(afterAvatarSessionEnds())

        dispatch({
          type: 'DidLogout'
        })

        resolve()
      })
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

      dispatch(requestAvatarProperties(sessionInfo.agent_id))
    }, 100)
  }
}

function getKicked (msg) {
  return (dispatch, getState, extra) => {
    const activeState = getState()
    const agentId = getAgentId(activeState)
    const sessionId = getSessionId(activeState)
    const msgAgentId = getValueOf(msg, 'UserInfo', 0, 'AgentID')
    const msgSessionId = getValueOf(msg, 'UserInfo', 0, 'SessionID')

    if (agentId === msgAgentId && sessionId === msgSessionId) {
      dispatch(afterAvatarSessionEnds())

      dispatch({
        type: 'UserWasKicked',
        reason: getStringValueOf(msg, 'UserInfo', 0, 'Reason')
      })
    }
  }
}

// Cleanup thats happens after logout and getting kicked
function afterAvatarSessionEnds () {
  return (dispatch, getState, extra) => {
    extra.circuit.close()
    extra.circuit.removeAllListeners()
    extra.circuit = null

    extra.hoodie.trigger('avatarDidLogout')

    return dispatch(deleteOldLocalChat())
  }
}

function requestAvatarProperties (avatarID) {
  return (dispatch, getState, { circuit }) => {
    const activeState = getState()
    const agentID = getAgentId(activeState)
    const sessionID = getSessionId(activeState)

    circuit.send('AvatarPropertiesRequest', {
      AgentData: [
        {
          AgentID: agentID,
          SessionID: sessionID,
          AvatarID: avatarID
        }
      ]
    }, true)
  }
}
