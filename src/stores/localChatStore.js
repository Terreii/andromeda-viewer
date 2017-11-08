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
    case 'didLogin':
      return action.localChatHistory
        .reduce((chatData, msg) => chatData.push(Immutable.Map(msg)), state)
        .sort((a, b) => a.get('time') - b.get('time'))
    default:
      return state
  }
}
