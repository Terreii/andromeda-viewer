/*
 * Stores all LocalChat-Messages
 */

import { Map, List } from 'immutable'

// Filter the data
export default function localChatReducer (state = List(), action) {
  switch (action.type) {
    case 'ChatFromSimulator':
      // filter out start typing and end typing
      if (action.msg.chatType === 4 || action.msg.chatType === 5) return state
      return state.push(Map(action.msg))

    case 'didLogin':
      return action.localChatHistory
        .reduce((chatData, msg) => chatData.push(Map({
          ...msg,
          didSave: true
        })), state)
        .sort((a, b) => a.get('time') - b.get('time'))

    case 'StartSavingLocalChatMessages':
      if (action.saving.length === 0) return state

      return state.map(msg => {
        if (!action.saving.includes(msg.get('_id'))) return msg

        return msg.merge({
          didSave: true
        })
      })

    case 'didSaveLocalChatMessage':
      if (action.didError.length === 0 && action.saved.length === 0) return state

      const ids = action.saved.map(msg => msg._id)
      return state.map(msg => {
        const id = msg.get('_id')

        if (action.didError.includes(id)) {
          return msg.set('didSave', false)
        }

        const index = ids.indexOf(id)
        if (index >= 0) {
          return msg.merge(action.saved[index])
        }

        return msg
      })

    case 'DidLogout':
    case 'UserWasKicked':
      return List()

    default:
      return state
  }
}
