'use strict'

import packageJSON from './package.json'

export const viewerName = packageJSON.name

export const viewerVersion = packageJSON.version + '.0'

export const viewerPlatform = (() => {
  if (typeof window !== 'undefined') {
    switch (window.navigator.platform) {
      case 'MacIntel':
        return 'Mac'
      case 'Win32':
        return 'Win'
      default:
        return 'Lin'
    }
  } else { // for testing
    return 'Lin'
  }
})()
