'use strict';

var crypto = require('crypto');

var xmlrpc = require('xmlrpc');

var viewerInfo = require('./viewerInfo');

function login (firstName, lastName, password, callback) {
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
    }], callback);
  });
}

module.exports = {
  login: login
};
