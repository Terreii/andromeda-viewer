'use strict'

var packageJSON = require('./package.json')

var platform
if (typeof window !== 'undefined') {
  switch (window.navigator.platform) {
    case 'MacIntel':
      platform = 'Mac'
      break
    case 'Win32':
      platform = 'Win'
      break
    default:
      platform = 'Lin'
  }
} else { // for testing
  platform = 'Lin'
}

module.exports = {
  get name () {
    return packageJSON.name
  },
  get version () {
    return packageJSON.version + '.0'
  },
  get platform () {
    return platform
  }
}
