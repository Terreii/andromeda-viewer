// Reducer for general session info.

import { createReducer } from '@reduxjs/toolkit'

function getDefaultState () {
  return {
    avatarIdentifier: null,
    activeChatTab: 'local',
    error: null
  }
}

export default createReducer(getDefaultState(), {
  didLogin (state, action) {
    for (const [keyRaw, value] of Object.entries(action.sessionInfo)) {
      // transform keys from session_id to sessionId
      const key = keyRaw.split('_').map((part, index) => index === 0
        ? part
        : part.charAt(0).toUpperCase() + part.slice(1)
      ).join('')

      if ([
        'buddy-list',
        'inventory-root',
        'inventory-skeleton',
        'login',
        'regionX',
        'regionY',
        'simIp',
        'simPort',
        'seedCapability',
        'circuitCode',
        'firstName',
        'lastName',
        'lookAt',
        'message'
      ].includes(key)) {
        // Remove data that is stored somewhere else
        continue
      }

      state[key] = value
    }
    state.avatarIdentifier = action.avatarIdentifier
  },

  CHAT_TAB_CHANGED (state, action) {
    state.activeChatTab = action.key
  },

  DidLogout: getDefaultState,

  UserWasKicked (oldState, action) {
    const state = getDefaultState()
    state.error = action.reason
    return state
  },

  ClosePopup (state, action) {
    state.error = null
  }
})
