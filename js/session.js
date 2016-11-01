'use strict'

var crypto = require('crypto')

var viewerInfo = require('./viewerInfo')
var Circuit = require('./circuit')
var simActionsForUI = require('./actions/simAction')
var AvatarName = require('./avatarName')

// true if there is a running session
var isLoggedIn = false

// Stores the result of the xmlrpc login & tracks the changes
var sessionInfo = {}

var regionInfo = {}
var regionID

var position = {
  position: [],
  lookAt: []
}

var activeCircuit

// Logon the user. It will send a XMLHttpRequest to the server.
function login (firstName, lastName, password, callback) {
  if (isLoggedIn) {
    throw new Error('There is already an avatar logged in!')
  }

  var hash = crypto.createHash('md5')
  hash.update(password, 'ascii')
  var passwdFinal = '$1$' + hash.digest('hex')

  var loginData = {
    first: firstName,
    last: lastName,
    passwd: passwdFinal,
    start: 'last',
    channel: viewerInfo.name,
    version: viewerInfo.version,
    platform: viewerInfo.platform,
    // mac will be added on the server side
    options: [],
    agree_to_tos: 'true',
    read_critical: 'true'
  }

  var xhr = new window.XMLHttpRequest()
  xhr.open('POST', 'login')
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.responseType = 'json'
  xhr.onload = function () {
    var response
    if (typeof this.response === 'string') { // IE doesn't support json response
      response = JSON.parse(this.response)
    } else {
      response = this.response
    }

    isLoggedIn = response.login === 'true'
    if (isLoggedIn) {
      sessionInfo = response
      connectToSim(sessionInfo.sim_ip, sessionInfo.sim_port,
        sessionInfo.circuit_code, callback)
    } else {
      // error
      callback(response)
    }
  }
  xhr.send(JSON.stringify(loginData))
}

// Placeholder for the logout process
function logout () {
  if (!isLoggedIn) {
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
function connectToSim (ip, port, circuitCode, callback) {
  callback(undefined, sessionInfo)
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

module.exports = {
  login: login,
  logout: logout,
  get isLoggedIn () {
    return isLoggedIn
  },
  getActiveCircuit: function () {
    return activeCircuit || {}
  },
  getInfo: function (infoName) {
    return sessionInfo[infoName]
  },
  getInfoNames: function () {
    var list = []
    for (var name in sessionInfo) {
      if (sessionInfo.hasOwnProperty(name)) {
        list.push(name)
      }
    }
    return list
  },
  getAvatarName: function () {
    return new AvatarName(sessionInfo.first_name, sessionInfo.last_name)
  },
  getSimIp: function () {
    return sessionInfo.sim_ip
  },
  getSimPort: function () {
    return sessionInfo.sim_port
  },
  getMessageOfTheDay: function () {
    return sessionInfo.message
  },
  getCircuitCode: function () {
    return sessionInfo.circuit_code
  },
  getAgentId: function () {
    return sessionInfo.agent_id
  },
  getInventoryHost: function () {
    return sessionInfo.inventory_host
  },
  getSeedCapability: function () {
    return sessionInfo.seed_capability
  },
  getAgentAccess: function () {
    return sessionInfo.agent_access
  },
  getSessionId: function () {
    return sessionInfo.session_id
  },
  getParentEstateID: function () {
    return regionInfo.ParentEstateID.value
  },
  getRegionID: function () {
    return regionID
  },
  getPosition: function () {
    return position.position.value
  }
}
