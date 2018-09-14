/*
 * Reduces all IM-Chats and IM-Messanges
 */

import Immutable from 'immutable'

function setHistory (state, action) {
  const messages = Immutable.fromJS(action.messages).concat(state.get('messages'))
  const imIds = []
  const messagesFiltered = messages.filter(msg => {
    // filter duplicate messages.
    const id = msg.get('_id')
    if (imIds.includes(id)) {
      return false
    }
    imIds.push(id)
    return true
  })
  return state.merge({
    didLoadHistory: true,
    isLoadingHistory: false,
    messages: messagesFiltered
  })
}

function IMChat (state = Immutable.Map(), action) {
  switch (action.type) {
    case 'CreateNewIMChat':
    case 'IMChatInfosLoaded':
      return state.merge({
        chatUUID: action.chatUUID,
        saveId: action.saveId,
        type: action.chatType,
        withId: action.target,
        didLoadHistory: state.get('didLoadHistory') || false,
        isLoadingHistory: state.get('isLoadingHistory') || false,
        active: true,
        messages: state.has('messages') ? state.get('messages') : Immutable.List()
      })
    case 'ImprovedInstantMessage':
    case 'SelfSendImprovedInstantMessage':
      const msg = Immutable.Map(action.msg)
      const messages = state.has('messages') ? state.get('messages') : Immutable.List()
      const nextMessages = messages.push(msg)
      return state.set('messages', nextMessages)
    default:
      return state
  }
}

export default function IMReducer (state = Immutable.Map(), action) {
  switch (action.type) {
    case 'CreateNewIMChat':
      return state.set(action.chatUUID, IMChat(state.get(action.chatUUID), action))

    case 'IMChatInfosLoaded':
      return action.chats.reduce((lastState, chat) => {
        const innerAction = Object.assign({}, chat, {
          type: action.type
        })
        const updatedChat = IMChat(state.get(action.chatUUID), innerAction)
        return lastState.set(chat.chatUUID, updatedChat)
      }, state)

    case 'ImprovedInstantMessage':
    case 'SelfSendImprovedInstantMessage':
      // filter start/end typing
      if (action.msg.dialog === 41 || action.msg.dialog === 42) return state
      return state.set(action.msg.chatUUID, IMChat(state.get(action.msg.chatUUID), action))

    case 'IMHistoryStartLoading':
      return state.setIn([action.chatUUID, 'isLoadingHistory'], true)

    case 'IMHistoryLoaded':
      return state.set(action.chatUUID, setHistory(state.get(action.chatUUID), action))

    case 'DidLogout':
    case 'UserWasKicked':
      return Immutable.Map()

    default:
      return state
  }
}
