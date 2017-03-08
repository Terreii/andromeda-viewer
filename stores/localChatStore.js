'use strict'

/*
 * Stores all LocalChat-Messanges
 */

import Immutable from 'immutable'

// Filter the data
export function localChatStore (state = Immutable.List(), action) {
  switch (action.type) {
    case 'ChatFromSimulator':
      return state.push(Immutable.Map(action.msg))
    default:
      return state
  }
}
