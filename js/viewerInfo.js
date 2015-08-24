'use strict';

var os = require('os');

var packageJSON = require('../package.json');

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
  }
};
