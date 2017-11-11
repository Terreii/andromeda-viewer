import {Map} from 'immutable'

export default function SessionReducer (state = Map({loggedIn: false}), action) {
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
            console.log(info)
            return info

          default:
            info[keyFixed] = action.sessionInfo[key]
            return info
        }
      }, {})
      sessionInfo.loggedIn = true
      return state.merge(sessionInfo)

    default:
      return state
  }
}
