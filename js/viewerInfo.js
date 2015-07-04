'use strict';

var os = require('os');

var packageJSON = require('../package.json');

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

var platform;
switch (os.platform()) {
  case 'darwin':
    platform = 'Mac';
    break;
  case 'win32':
    platform = 'Win';
    break;
  default:
    platform = 'Lin';
}

module.exports = {
  get name () {
    return packageJSON.name;
  },
  get version () {
    return packageJSON.version + '.0';
  },
  get platform () {
    return platform;
  },
  get mac () {
    return macaddress;
  }
};
