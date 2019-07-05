// Reducer for general session info.

import { getValueOf, getValuesOf } from '../network/msgGetters'

export default function sessionReducer (state = {
  avatarIdentifier: null,
  activeChatTab: 'local',
  notifications: [],
  notificationId: 0,
  error: null
}, action) {
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
          case 'inventory-root':
          case 'inventory-skeleton':
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
      sessionInfo.avatarIdentifier = action.avatarIdentifier
      sessionInfo.position = {
        position: [],
        lookAt: JSON.parse(action.sessionInfo.look_at.replace(/r/gi, ''))
      }
      sessionInfo.regionInfo = {}
      return {
        ...state,
        ...sessionInfo
      }

    case 'AgentMovementComplete':
      return {
        ...state,
        position: {
          ...state.position,
          position: getValueOf(action, 'Data', 'Position'),
          lookAt: getValueOf(action, 'Data', 'LookAt')
        }
      }

    case 'RegionInfo':
      return {
        ...state,
        regionInfo: Object.assign(
          {},
          getValuesOf(action, 'RegionInfo', 0, []),
          getValuesOf(action, 'RegionInfo2', 0, [])
        )
      }

    case 'RegionHandshake':
      return {
        ...state,
        regionInfo: {
          ...state.regionInfo,
          regionID: action.regionID,
          flags: action.flags
        }
      }

    case 'CHAT_TAB_CHANGED':
      return {
        ...state,
        activeChatTab: action.key
      }

    case 'NOTIFICATION_RECEIVED':
      const notificationId = state.notificationId
      return {
        ...state,
        notifications: state.notifications.concat([{
          ...action.msg,
          id: notificationId
        }]),
        notificationId: notificationId + 1
      }

    case 'NOTIFICATION_CLOSED':
      return {
        ...state,
        notifications: state.notifications.filter(notification => action.id !== notification.id)
      }

    case 'DidLogout':
    case 'UserWasKicked':
      return {
        avatarIdentifier: null,
        activeChatTab: 'local',
        notifications: [],
        notificationId: 0,
        error: action.type === 'UserWasKicked' ? action.reason : null
      }

    case 'ClosePopup':
      return {
        ...state,
        error: null
      }

    case 'SeedCapabilitiesLoaded':
      return {
        ...state,
        eventQueueGetUrl: action.capabilities.EventQueueGet
      }

    default:
      return state
  }
}
