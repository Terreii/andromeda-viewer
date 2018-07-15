/*
 * Stores all LocalChat-Messages
 */

import {Map, List} from 'immutable'

// Filter the data
export default function localChatReducer (state = List(), action) {
  switch (action.type) {
    case 'ChatFromSimulator':
      // filter out start typing and end typing
      if (action.msg.chatType === 4 || action.msg.chatType === 5) return state
      return state.push(Map(action.msg))

    case 'didLogin':
      return action.localChatHistory
        .reduce((chatData, msg) => chatData.push(Map(msg)), state)
        .sort((a, b) => a.get('time') - b.get('time'))

    case 'DidLogout':
    case 'UserWasKicked':
      return List()

    default:
      return state
  }
}
