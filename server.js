'use strict';

var crypto = require('crypto');

var read = require('read');
var xmlrpc = require('xmlrpc');

var viewerInfo = require('./js/viewerInfo');
var parseFullName = require('./js/avatarName');

// SL uses its own tls-certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

console.log('Andromeda is running!\nNot ready for production!\n');

console.log('Please enter your sl-login.');

// asking for the avatar-name
read({prompt: 'Avatar name (first.last): '}, function (er, name) {
  if (er) {
    console.error('Invalid login!');
    return;
  }
  // asking for the password
  read({prompt: 'Password: ', silent: true}, function (er, password) {
    if (er) {
      console.error('Something went wrong!');
      return;
    }
    if (password.length === 0) {
      console.error('Password is to short!');
      return;
    }

    var parsedName = parseFullName(name);
    console.log('Your login is: first: %s, last: %s',
      parsedName.first, parsedName.last);

    var hash = crypto.createHash('md5');
    hash.update(password, 'ascii');
    var passwdFinal = '$1$' + hash.digest('hex');

    var xmlrpcClient = xmlrpc.createSecureClient({
      host: 'login.agni.lindenlab.com',
      port: 443,
      path: '/cgi-bin/login.cgi'
    });

    xmlrpcClient.methodCall('login_to_simulator', [{
      first: parsedName.first,
      last: parsedName.last,
      passwd: passwdFinal,
      start: 'last',
      channel: viewerInfo.name,
      version: viewerInfo.version,
      platform: viewerInfo.platform,
      mac: viewerInfo.mac,
      options: [],
      agree_to_tos: 'true',
      read_critical: 'true'
    }], function (error, value) {
      console.log(error, typeof value, value);
    });
  });
});
