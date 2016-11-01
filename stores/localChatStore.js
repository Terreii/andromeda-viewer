'use strict'

/*
 * Stores all LocalChat-Messanges
 */

var Store = require('flux/utils').Store
var Immutable = require('immutable')

var Dispatcher = require('../js/uiDispatcher')

// This stores data
var chat = Immutable.List([])

var sourceTypes = [
  'system',
  'agent',
  'object'
]

var chatTypes = [
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
  var sourceT = sourceTypes[Number(chatData.SourceType.value) || 0]
  var chatT = chatTypes[Number(chatData.ChatType.value) || 0]
  var msg = {
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
var localChatStore = new Store(Dispatcher)
localChatStore.__onDispatch = function (payload) {
  switch (payload.actionType) {
    case 'ChatFromSimulator':
      addToChatFromServer(payload.ChatData.data[0])
      this.__emitChange()
      break

  }
}
localChatStore.getMessages = function () {
  return chat
}

function fromCharArrayToString (buffer) {
  var str = buffer.toString()
  if (str.charAt(str.length - 1) === '\n') {
    return str.substring(0, str.length - 1)
  }
  return str
}

module.exports = localChatStore
