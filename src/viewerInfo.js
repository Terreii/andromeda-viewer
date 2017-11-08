'use strict'

import { name, version } from '../package.json'

export const viewerName = name

export const viewerVersion = version + '.0'

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
