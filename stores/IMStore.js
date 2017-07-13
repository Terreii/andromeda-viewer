'use strict'

/*
 * Stores all IM-Chats and IM-Messanges
 */

import Immutable from 'immutable'

function addToChats (chats, msg, fromSelf) {
  // if it is send by this user the conversation will be of the toAgentId
  if (msg.dialog === 41 || msg.dialog === 42) { // filter start/end typing
    return chats
  }

  const msgMap = Immutable.Map(msg)
  const conv = fromSelf ? msg.toAgentID : msg.chatUUID

  let convStore
  if (chats.has(conv)) {
    convStore = chats.get(conv)
    const messages = convStore.get('messages').push(msgMap)
    convStore = convStore.set('messages', messages)
  } else {
    convStore = Immutable.Map({
      chatUUID: conv,
      didLoadHistory: false,
      isLoadingHistory: false,
      messages: Immutable.List([msgMap])
    })
  }

  return chats.set(conv, convStore)
}

function setHistory (state, action) {
  const messages = Immutable.fromJS(action.messages).concat(state.get('messages'))
  const imIds = []
  const messagesFiltered = messages.filter(msg => {
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

export default function IMStore (state = Immutable.Map(), action) {
  switch (action.type) {
    case 'ImprovedInstantMessage':
      return addToChats(state, action.msg, false)
    case 'SelfSendImprovedInstantMessage':
      return addToChats(state, action.msg, true)
    case 'IMHistoryStartLoading':
      return state.setIn([action.chatUUID, 'isLoadingHistory'], true)
    case 'IMHistoryLoaded':
      return state.set(action.chatUUID, setHistory(state.get(action.chatUUID), action))
    default:
      return state
  }
}
