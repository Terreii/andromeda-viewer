'use strict'

/*
 * Stores all LocalChat-Messanges
 */

import {ReduceStore} from 'flux/utils'
import Immutable from 'immutable'

import Dispatcher from '../network/uiDispatcher'

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
function addToChatFromServer (chat, chatData) {
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
  return chat.push(Immutable.Map(msg))
}

// Filter the data
class LocalChatStore extends ReduceStore {
  getInitialState () {
    return Immutable.List([])
  }

  reduce (state, action) {
    switch (action.type) {
      case 'ChatFromSimulator':
        return addToChatFromServer(state, action.ChatData.data[0])
      default:
        return state
    }
  }
}
export default new LocalChatStore(Dispatcher)

function fromCharArrayToString (buffer) {
  var str = buffer.toString()
  if (str.charCodeAt(str.length - 1) === 0) {
    return str.substring(0, str.length - 1)
  }
  return str
}
