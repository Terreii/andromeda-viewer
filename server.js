'use strict';

var crypto = require('crypto');
var os = require('os');

var read = require('read');
var xmlrpc = require('xmlrpc');

var macaddress;
// the macaddress can be found in node version 0.12 in os.networkInterfaces()
require('macaddress').one(function (error, mac) {
  if (!error) {
    macaddress = mac;
  } else {
    macaddress = '00:00:00:00:00:00';
    console.error('Mac address wasn\'t found!');
  }
});

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

    var osName;
    switch (os.platform()) {
      case 'darwin':
        osName = 'Mac';
        break;
      case 'win32':
        osName = 'Win';
        break;
      default:
        osName = 'Lin';
    }

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
      channel: 'andromeda',
      version: '0.0.0.1',
      platform: osName,
      mac: macaddress,
      options: [],
      agree_to_tos: 'true',
      read_critical: 'true'
    }], function (error, value) {
      console.log(error, typeof value, value);
    });
  });
});

// parses an avatar name
// Searches for a dot or white space that separates the first and last names
// if neither is given, then 'resident' will be used for the last name
function parseFullName (name) {
  if (typeof name !== 'string') {
    throw new TypeError('Name must be a string');
  }
  name = name.trim();

  var parts;
  var parsed = name.match(/[\.\s]/);
  // if the first name and last name are given
  if (parsed) {
    parts = name.split(parsed[0]);
  } else {
    parts = [
      name,
      'Resident'
    ];
  }

  return {
    first: parts[0],
    last: parts[1]
  };
}
