'use strict';

var crypto = require('crypto');

var xmlrpc = require('xmlrpc');

var viewerInfo = require('./viewerInfo');
var messages = require('./networkMessages');

// true if there is a running session
var isLoggedIn = false;

// Stores the result of the xmlrpc login & tracks the changes
var sessionInfo;

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
}

// Login to a sim. Is called on the login process and sim-change
function connectToSim (ip, port, circuit_code, callback) {
  callback(undefined, sessionInfo);
  messages.types.BOOL(new Buffer(1));
}

module.exports = {
  login: login,
  logout: logout,
  get isLoggedIn () {
    return isLoggedIn;
  }
};
