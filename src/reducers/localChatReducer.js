/*
 * Stores all LocalChat-Messages
 */

import { LocalChatAudible, LocalChatSourceType, LocalChatType } from '../types/chat'

export default function localChatReducer (state = [], action) {
  switch (action.type) {
    case 'CHAT_FROM_SIMULATOR_RECEIVED':
      // filter out start typing and end typing
      return action.msg.chatType === LocalChatType.StartTyping ||
        action.msg.chatType === LocalChatType.StopTyping
        ? state
        : state.concat([{
          ...action.msg,
          didSave: false
        }])

    case 'didLogin':
      const chat = action.localChatHistory.map(msg => ({
        ...msg,
        didSave: true
      }))
      chat.push({
        _id: 'messageOfTheDay',
        fromName: 'Message of the Day',
        fromId: 'messageOfTheDay',
        sourceType: LocalChatSourceType.System,
        chatType: LocalChatType.OwnerSay,
        audible: LocalChatAudible.Fully,
        position: [0, 0, 0],
        message: action.sessionInfo.message,
        time: action.sessionInfo.seconds_since_epoch * 1000,
        didSave: true
      })
      return state.concat(chat).sort((a, b) => a.time - b.time)

    case 'NOTIFICATION_IN_CHAT_ADDED':
      return state.concat([{
        _id: 'notification_' + state.length,
        fromName: action.fromName,
        fromId: action.fromId || 'object',
        sourceType: LocalChatSourceType.Object,
        chatType: LocalChatType.OwnerSay,
        audible: LocalChatAudible.Fully,
        position: [0, 0, 0],
        message: action.text,
        time: action.time,
        didSave: false
      }])

    case 'StartSavingLocalChatMessages':
      if (action.saving.length === 0) return state

      return state.map(msg => {
        if (!action.saving.includes(msg._id)) return msg

        return {
          ...msg,
          didSave: true
        }
      })

    case 'didSaveLocalChatMessage':
      if (action.didError.length === 0 && action.saved.length === 0) return state

      const ids = action.saved.map(msg => msg._id)
      return state.map(msg => {
        if (action.didError.includes(msg._id)) {
          return {
            ...msg,
            didSave: false
          }
        }

        const index = ids.indexOf(msg._id)
        if (index >= 0) {
          return {
            ...msg,
            ...action.saved[index]
          }
        }

        return msg
      })

    case 'DidLogout':
    case 'UserWasKicked':
      return []

    default:
      return state
  }
}
