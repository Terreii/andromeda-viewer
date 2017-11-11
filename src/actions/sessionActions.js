import crypto from 'crypto'

import { viewerName, viewerVersion, viewerPlatform } from '../viewerInfo'
import AvatarName from '../avatarName'
import Circuit from '../network/circuit'

import { getLocalChatHistory, loadIMChats } from './chatMessageActions'
import { getAllFriendsDisplayNames } from './friendsActions'
import { fetchSeedCapabilities } from './llsd'
import simActions from './simAction'

// Actions for the session of an avatar

// Logon the user. It will post using fetch to the server.
export function login (firstName, lastName, password, grid) {
  return async (dispatch, getState, extra) => {
    if (getState().session.get('loggedIn')) throw new Error('There is already an avatar logged in!')

    const hash = crypto.createHash('md5')
    hash.update(password, 'ascii')
    const finalPassword = '$1$' + hash.digest('hex')

    const loginData = {
      grid,
      first: firstName,
      last: lastName,
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

    const response = await window.fetch('/hoodie/andromeda-viewer/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const body = await response.json()

    if (body.login !== 'true') throw body

    // Set the active circuit
    extra.circuit = connectToSim(body)

    const avatarName = new AvatarName({first: body.first_name, last: body.last_name})
    const avatarIdentifier = `${avatarName.getFullName()}@${grid.name}`
    const localChatHistory = await dispatch(getLocalChatHistory(avatarIdentifier))

    dispatch({
      type: 'didLogin',
      name: avatarName,
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
  return (dispatch, getState, {circuit}) => {
    const session = getState().session
    if (!session.get('loggedIn')) {
      throw new Error("You aren't logged in!")
    }
    console.error(`I'm sorry Dave, I'm afraid I can't do that.`)

    circuit.send('LogoutRequest', {
      AgentData: [
        {
          AgentID: session.get('agentId'),
          SessionID: session.get('sessionId')
        }
      ]
    })
  }
  // TODO wait for the LogoutReply
}

// Login to a sim. Is called on the login process and sim-change
function connectToSim (sessionInfo) {
  const circuitCode = sessionInfo.circuit_code
  const activeCircuit = new Circuit(sessionInfo.sim_ip, sessionInfo.sim_port, circuitCode)

  activeCircuit.send('UseCircuitCode', {
    CircuitCode: [
      {
        Code: circuitCode,
        SessionID: sessionInfo.session_id,
        ID: sessionInfo.agent_id
      }
    ]
  })

  activeCircuit.send('CompleteAgentMovement', {
    AgentData: [
      {
        AgentID: sessionInfo.agent_id,
        SessionID: sessionInfo.session_id,
        CircuitCode: circuitCode
      }
    ]
  })

  activeCircuit.send('AgentUpdate', {
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
  })

  activeCircuit.send('UUIDNameRequest', {
    UUIDNameBlock: [
      {
        ID: sessionInfo.agent_id
      }
    ]
  })

  activeCircuit.on('packetReceived', simActions)

  setTimeout(function () {
    activeCircuit.send('RequestRegionInfo', {
      AgentData: [
        {
          AgentID: sessionInfo.agent_id,
          SessionID: sessionInfo.session_id
        }
      ]
    })
  }, 100)

  return activeCircuit
}
