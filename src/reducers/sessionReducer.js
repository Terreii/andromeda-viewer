import { Map } from 'immutable'

import { getValueOf, getValuesOf } from '../network/msgGetters'

export default function SessionReducer (state = Map({ loggedIn: false, error: null }), action) {
  switch (action.type) {
    case 'didLogin':
      const sessionInfo = Object.keys(action.sessionInfo).reduce((info, key) => {
        // transform keys from session_id to sessionId
        const keyFixed = key.split('_').map((part, index) => index === 0
          ? part
          : part.charAt(0).toUpperCase() + part.slice(1)
        ).join('')

        // Remove data that is stored somewhere else
        switch (keyFixed) {
          case 'buddy-list':
          case 'login':
          case 'seedCapability':
          case 'firstName':
          case 'lastName':
          case 'lookAt':
          case 'message':
            return info

          default:
            info[keyFixed] = action.sessionInfo[key]
            return info
        }
      }, {})
      sessionInfo.loggedIn = true
      sessionInfo.position = Map({
        position: [],
        lookAt: JSON.parse(action.sessionInfo.look_at.replace(/r/gi, ''))
      })
      sessionInfo.regionInfo = Map()
      return state.merge(sessionInfo)

    case 'AgentMovementComplete':
      return state.mergeDeep({
        position: {
          position: getValueOf(action, 'Data', 'Position'),
          lookAt: getValueOf(action, 'Data', 'LookAt')
        }
      })

    case 'RegionInfo':
      return state.mergeDeep({
        regionInfo: Object.assign(
          {},
          getValuesOf(action, 'RegionInfo', 0, []),
          getValuesOf(action, 'RegionInfo2', 0, [])
        )
      })

    case 'RegionHandshake':
      return state.mergeDeep({
        regionInfo: {
          regionID: action.regionID,
          flags: action.flags
        }
      })

    case 'DidLogout':
    case 'UserWasKicked':
      return Map({
        loggedIn: false,
        error: action.type === 'UserWasKicked' ? action.reason : null
      })

    case 'ClosePopup':
      return state.set('error', null)

    case 'SeedCapabilitiesLoaded':
      return state.set('eventQueueGetUrl', action.capabilities.EventQueueGet)

    default:
      return state
  }
}
