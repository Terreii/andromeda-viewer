'use strict';

var crypto = require('crypto');

var xmlrpc = require('xmlrpc');

var viewerInfo = require('./viewerInfo');
var Circuit = require('./circuit');

// true if there is a running session
var isLoggedIn = false;

// Stores the result of the xmlrpc login & tracks the changes
var sessionInfo;

var activeCircuit;

// Logges the user in. Uses the XML-RPC for it.
function login (firstName, lastName, password, callback) {
  if (isLoggedIn) {
    throw new Error('There is allready an avatar logged in!');
  }
  viewerInfo.getMAC(function (macaddress) {
    var hash = crypto.createHash('md5');
    hash.update(password, 'ascii');
    var passwdFinal = '$1$' + hash.digest('hex');

    var xmlrpcClient = xmlrpc.createSecureClient({
      host: 'login.agni.lindenlab.com',
      port: 443,
      path: '/cgi-bin/login.cgi'
    });

    xmlrpcClient.methodCall('login_to_simulator', [{
      first: firstName,
      last: lastName,
      passwd: passwdFinal,
      start: 'last',
      channel: viewerInfo.name,
      version: viewerInfo.version,
      platform: viewerInfo.platform,
      mac: macaddress,
      options: [],
      agree_to_tos: 'true',
      read_critical: 'true'
    }], function (error, data) {
      if (error) {
        callback(error);
        return;
      }
      isLoggedIn = true;
      sessionInfo = data;
      connectToSim(sessionInfo.sim_ip, sessionInfo.sim_port,
        sessionInfo.circuit_code, callback);
    });
  });
}

// Placeholder for the logiut process
function logout () {
  if (!isLoggedIn) {
    throw new Error('You aren\'t logged in!');
  }
  console.error("I'm sorry " + sessionInfo.firstName +
    ", I'm afraid I can't do that.");

  activeCircuit.send('LogoutRequest', {
    AgentData: [
      {
        AgentID: sessionInfo.agent_id,
        SessionID: sessionInfo.session_id
      }
    ]
  });

  // TODO wait for the LogoutReply
}

// Login to a sim. Is called on the login process and sim-change
function connectToSim (ip, port, circuit_code, callback) {
  callback(undefined, sessionInfo);
  activeCircuit = new Circuit(ip, port, circuit_code);
  activeCircuit.send('UseCircuitCode', {
    CircuitCode: [
      {
        Code: circuit_code,
        SessionID: sessionInfo.session_id,
        ID: sessionInfo.agent_id
      }
    ]
  });

  activeCircuit.send('CompleteAgentMovement', {
    AgentData: [
      {
        AgentID: sessionInfo.agent_id,
        SessionID: sessionInfo.session_id,
        CircuitCode: circuit_code
      }
    ]
  });

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
  });

  activeCircuit.send('UUIDNameRequest', {
    UUIDNameBlock: [
      {
        ID: sessionInfo.agent_id
      }
    ]
  });

  activeCircuit.on('packetReceived', function (data) {
    console.log('On: ' + new Date().toISOString() + '    ', data.body.name);
  });

  activeCircuit.on('RegionHandshake', sendRegionHandshakeReply);

  activeCircuit.on('StartPingCheck', CompletePingCheck);
}

function sendRegionHandshakeReply (RegionHandshake) {
  // RegionHandshake.body.blocks[0].data.
  var flags = RegionHandshake.body.RegionInfo.data[0].RegionFlags.value;
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
  });
  console.log('Handshake', flags);
}

function CompletePingCheck (StartPingCheck) {
  var id = StartPingCheck.body.PingID.data[0].PingID.value;
  activeCircuit.send('CompletePingCheck', {
    PingID: [
      {
        PingID: id
      }
    ]
  });
  console.log('Ping:', id);
}

module.exports = {
  login: login,
  logout: logout,
  get isLoggedIn () {
    return isLoggedIn;
  }
};
