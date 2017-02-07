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
  const conv = fromSelf ? msg.toAgentID : msg.fromId

  const convStore = chats.has(conv)
    ? chats.get(conv).push(msgMap)
    : Immutable.List([msgMap])

  return chats.set(conv, convStore)
}

export default function IMStore (state = Immutable.Map(), action) {
  switch (action.type) {
    case 'ImprovedInstantMessage':
      return addToChats(state, action.msg, false)
    case 'SelfSendImprovedInstantMessage':
      return addToChats(state, action.msg, true)
    default:
      return state
  }
}
