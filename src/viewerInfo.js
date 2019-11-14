import { name, version } from '../package.json'

export const viewerName = name

export const viewerVersion = version + '.0'

export const viewerPlatform = (() => {
  if (typeof window !== 'undefined') {
    switch (window.navigator.platform) {
      case 'MacIntel':
      case 'iPhone':
      case 'iPhone Simulator':
      case 'iPod':
      case 'iPod Simulator':
      case 'iPad':
      case 'iPad Simulator':
        return 'Mac'
      case 'Win32':
      case 'WinCE':
        return 'Win'
      default:
        return 'Lin'
    }
  } else { // for testing
    return 'Lin'
  }
})()

export const viewerPlatformVersion = (() => {
  const defaultVersion = '70.0.0'

  if (window == null || window.navigator == null || !window.navigator.userAgent) {
    return defaultVersion
  }

  const userAgent = window.navigator.userAgent

  if (userAgent.includes('Chrome')) {
    const index = userAgent.indexOf('Chrome') + 7
    const slice = userAgent.slice(index)
    const number = slice.split(/\s/)[0]
    return number || defaultVersion
  }

  const index = userAgent.lastIndexOf('/') + 1
  return userAgent.slice(index) || defaultVersion
})()
