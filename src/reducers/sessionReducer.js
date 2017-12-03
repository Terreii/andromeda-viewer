import {Map} from 'immutable'

export default function SessionReducer (state = Map({loggedIn: false, error: null}), action) {
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
            return info

          case 'message':
            const messageOfTheDay = action.sessionInfo.message
            const index = messageOfTheDay.search('http')
            const msgOfDayHref = messageOfTheDay.substr(index)
            const msgOfDayText = messageOfTheDay.substr(0, index)
            info.message = Map({
              href: msgOfDayHref,
              text: msgOfDayText
            })
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
          position: action.msg.position,
          lookAt: action.msg.lookAt
        }
      })

    case 'RegionInfo':
      return state.mergeDeep({
        regionInfo: Object.assign({}, action.msg.regionInfo, action.msg.regionInfo2)
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

    default:
      return state
  }
}
