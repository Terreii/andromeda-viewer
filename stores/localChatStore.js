'use strict'

/*
 * Stores all LocalChat-Messanges
 */

import {Store} from 'flux/utils'
import Immutable from 'immutable'

import Dispatcher from '../network/uiDispatcher'

// This stores data
let chat = Immutable.List([])

const sourceTypes = [
  'system',
  'agent',
  'object'
]

const chatTypes = [
  'whisper',
  'normal',
  'shout',
  'say',
  'startTyping',
  'stopTyping',
  'debug',
  'ownerSay'
]

// Add the messanges from the server/sim
function addToChatFromServer (chatData) {
  if (chatData.ChatType.value === 4 || chatData.ChatType.value === 5) {
    return // Start/stop typing
  }
  const sourceT = sourceTypes[Number(chatData.SourceType.value) || 0]
  const chatT = chatTypes[Number(chatData.ChatType.value) || 0]
  const msg = {
    fromName: fromCharArrayToString(chatData.FromName.value.toString('utf8')),
    sourceID: chatData.SourceID.value,
    ownerID: chatData.OwnerID.value,
    sourceType: sourceT,
    chatType: chatT,
    audible: chatData.Audible.value,
    position: chatData.Position.value,
    message: fromCharArrayToString(chatData.Message.value.toString('utf8')),
    time: new Date()
  }
  chat = chat.push(Immutable.Map(msg))
}

// Filter the data
class LocalChatStore extends Store {
  constructor () {
    super(Dispatcher)
  }

  __onDispatch (payload) {
    switch (payload.actionType) {
      case 'ChatFromSimulator':
        addToChatFromServer(payload.ChatData.data[0])
        this.__emitChange()
        break

    }
  }

  getMessages () {
    return chat
  }
}
export default new LocalChatStore()

function fromCharArrayToString (buffer) {
  var str = buffer.toString()
  if (str.charCodeAt(str.length - 1) === 0) {
    return str.substring(0, str.length - 1)
  }
  return str
}
