'use strict'

import crypto from 'crypto'

import { viewerName, viewerVersion, viewerPlatform } from './viewerInfo'
import Circuit from './network/circuit'
import simActionsForUI from './actions/simAction'
import AvatarName from './avatarName'
import State from './stores/state'
import { getLocalChatHistory } from './stores/database'

// true if there is a running session
let _isLoggedIn = false

// Stores the result of the xmlrpc login & tracks the changes
let sessionInfo = {}

let regionInfo = {}
let regionID

const position = {
  position: [],
  lookAt: []
}

let activeCircuit

// Logon the user. It will post using fetch to the server.
export function login (firstName, lastName, password, grid) {
  if (isLoggedIn()) {
    return Promise.reject(new Error('There is already an avatar logged in!'))
  }

  const hash = crypto.createHash('md5')
  hash.update(password, 'ascii')
  const passwdFinal = '$1$' + hash.digest('hex')

  const loginData = {
    grid,
    first: firstName,
    last: lastName,
    passwd: passwdFinal,
    start: 'last',
    channel: viewerName,
    version: viewerVersion,
    platform: viewerPlatform,
    // mac will be added on the server side
    options: [],
    agree_to_tos: 'true',
    read_critical: 'true'
  }

  return window.fetch('/andromeda-login', {
    method: 'POST',
    body: JSON.stringify(loginData),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => response.json()).then(body => {
    if (body.login === 'true') {
      sessionInfo = body
      connectToSim(body.sim_ip, body.sim_port, body.circuit_code)
      const avatarName = getAvatarName()
      getLocalChatHistory(avatarName.toString()).then(localChatHistory => {
        State.dispatch({
          type: 'didLogin',
          name: avatarName,
          uuid: getAgentId(),
          localChatHistory
        })
      })
      return body
    } else {
      throw body
    }
  })
}

// Placeholder for the logout process
export function logout () {
  if (!isLoggedIn()) {
    throw new Error("You aren't logged in!")
  }
  console.error("I'm sorry " + sessionInfo.firstName +
    ", I'm afraid I can't do that.")

  activeCircuit.send('LogoutRequest', {
    AgentData: [
      {
        AgentID: sessionInfo.agent_id,
        SessionID: sessionInfo.session_id
      }
    ]
  })

// TODO wait for the LogoutReply
}

// Login to a sim. Is called on the login process and sim-change
function connectToSim (ip, port, circuitCode) {
  activeCircuit = new Circuit(ip, port, circuitCode)
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

  activeCircuit.on('packetReceived', simActionsForUI)

  activeCircuit.on('RegionHandshake', sendRegionHandshakeReply)

  activeCircuit.on('AgentMovementComplete', function (AgentMovement) {
    var info = AgentMovement.body.Data.data[0]
    position.position = info.Position
    position.lookAt = info.LookAt
  })

  activeCircuit.on('StartPingCheck', CompletePingCheck)

  activeCircuit.on('RegionInfo', RegionInfo)

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
}

function sendRegionHandshakeReply (RegionHandshake) {
  regionID = RegionHandshake.body.RegionInfo2.data[0].RegionID.value
  var flags = RegionHandshake.body.RegionInfo.data[0].RegionFlags.value
  activeCircuit.send('RegionHandshakeReply', {
    AgentData: [
      {
        AgentID: sessionInfo.agent_id,
        SessionID: sessionInfo.session_id
      }
    ],
    RegionInfo: [
      {
        Flags: flags
      }
    ]
  })
}

function CompletePingCheck (StartPingCheck) {
  var id = StartPingCheck.body.PingID.data[0].PingID.value
  activeCircuit.send('CompletePingCheck', {
    PingID: [
      {
        PingID: id
      }
    ]
  })
}

function RegionInfo (info) {
  regionInfo = info.body.RegionInfo.data[0]

  var regionInfo2 = info.body.RegionInfo2.data[0]
  regionInfo.ProductSKU = regionInfo2.ProductSKU
  regionInfo.ProductName = regionInfo2.ProductName
  regionInfo.MaxAgents32 = regionInfo2.MaxAgents32
  regionInfo.HardMaxAgents = regionInfo2.HardMaxAgents
  regionInfo.HardMaxObjects = regionInfo2.HardMaxObjects
}

export function isLoggedIn () {
  return _isLoggedIn
}

export function getActiveCircuit () {
  return activeCircuit || {}
}

export function getInfo (infoName) {
  return sessionInfo[infoName]
}

export function getInfoNames () {
  const list = []
  for (var name in sessionInfo) {
    if (sessionInfo.hasOwnProperty(name)) {
      list.push(name)
    }
  }
  return list
}

export function getAvatarName () {
  return new AvatarName(sessionInfo.first_name, sessionInfo.last_name)
}

export function getSimIp () {
  return sessionInfo.sim_ip
}

export function getSimPort () {
  return sessionInfo.sim_port
}

export function getMessageOfTheDay () {
  return sessionInfo.message
}

export function getCircuitCode () {
  return sessionInfo.circuit_code
}

export function getAgentId () {
  return sessionInfo.agent_id
}

export function getInventoryHost () {
  return sessionInfo.inventory_host
}

export function getSeedCapability () {
  return sessionInfo.seed_capability
}

export function getAgentAccess () {
  return sessionInfo.agent_access
}

export function getSessionId () {
  return sessionInfo.session_id
}

export function getParentEstateID () {
  return regionInfo.ParentEstateID.value
}

export function getRegionID () {
  return regionID
}

export function getPosition () {
  return position.position.value
}
