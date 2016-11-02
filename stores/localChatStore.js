'use strict'

/*
 * Stores all LocalChat-Messanges
 */

import {Store} from 'flux/utils'
import Immutable from 'immutable'

import Dispatcher from '../network/uiDispatcher'
import {getLocalChat, updateLocalChat} from './database'
import {getAvatarName} from '../session'

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
  updateLocalChat(getAvatarName().toString(), msg)
  chat = chat.push(Immutable.Map(msg))
}

function addLoadedChatHistory (chatData, msg) {
  return chatData.push(Immutable.Map(msg))
}

let didInit = false

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
      case 'localChatLoaded':
        chat = payload.messages
          .reduce(addLoadedChatHistory, chat)
          .sort((a, b) => {
            return a.get('time').getTime() - b.get('time').getTime()
          })
        this.__emitChange()
    }
  }

  getMessages () {
    return chat
  }

  init () {
    if (didInit) {
      return
    } else {
      didInit = true
    }
    getLocalChat(getAvatarName().toString()).then(response => {
      return response.rows.map(row => Object.assign({}, row.doc, {
        time: new Date(row.doc.time)
      }))
    }).then(rows => {
      Dispatcher.dispatch({
        actionType: 'localChatLoaded',
        messages: rows
      })
    }).catch(err => console.error('error: ', err))
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
