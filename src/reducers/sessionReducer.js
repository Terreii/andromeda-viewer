// Reducer for general session info.

import { createReducer } from '@reduxjs/toolkit'

import { getValueOf, getValuesOf, getStringValueOf } from '../network/msgGetters'

function getDefaultState () {
  return {
    avatarIdentifier: null,
    position: {
      position: [],
      lookAt: []
    },
    regionInfo: {},
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
        'seedCapability',
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

    state.position = {
      position: [],
      lookAt: JSON.parse(action.sessionInfo.look_at.replace(/r/gi, ''))
    }
    state.regionInfo = {}
  },

  UDPAgentMovementComplete (state, action) {
    state.position.position = getValueOf(action, 'Data', 'Position')
    state.position.lookAt = getValueOf(action, 'Data', 'LookAt')
  },

  UDPRegionInfo (state, action) {
    const newRegionInfo = {
      ...getValuesOf(action, 'RegionInfo', 0, []),
      ...getValuesOf(action, 'RegionInfo2', 0, []),
      SimName: getStringValueOf(action, 'RegionInfo', 0, 'SimName'),
      ProductSKU: getStringValueOf(action, 'RegionInfo2', 0, 'ProductSKU'),
      ProductName: getStringValueOf(action, 'RegionInfo2', 0, 'ProductName')
    }

    for (const [key, value] of Object.entries(newRegionInfo)) {
      const newKey = key.charAt(0).toLowerCase() + key.slice(1)

      state.regionInfo[newKey] = value
    }
  },

  RegionHandshake (state, action) {
    state.regionInfo.regionID = action.regionID
    state.regionInfo.flags = action.flags
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
  },

  SeedCapabilitiesLoaded (state, action) {
    state.eventQueueGetUrl = action.capabilities.EventQueueGet
  }
})
