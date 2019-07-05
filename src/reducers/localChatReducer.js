/*
 * Stores all LocalChat-Messages
 */

export default function localChatReducer (state = [], action) {
  switch (action.type) {
    case 'ChatFromSimulator':
      // filter out start typing and end typing
      if (action.msg.chatType === 4 || action.msg.chatType === 5) return state
      return state.concat([
        action.msg
      ])

    case 'didLogin':
      const chat = action.localChatHistory.map(msg => ({
        ...msg,
        didSave: true
      }))
      chat.push({
        _id: 'messageOfTheDay',
        fromName: 'Message of the Day',
        sourceID: 'messageOfTheDay',
        sourceType: 0,
        chatType: 8,
        audible: 1,
        position: [0, 0, 0],
        message: action.sessionInfo.message,
        time: action.sessionInfo.seconds_since_epoch * 1000,
        didSave: true
      })
      return state.concat(chat).sort((a, b) => a.time - b.time)

    case 'NOTIFICATION_IN_CHAT_ADDED':
      return state.concat([{
        _id: 'notification_' + state.size,
        fromName: action.fromName,
        sourceID: action.fromId || 'object',
        sourceType: 2,
        chatType: 8,
        audible: 1,
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
