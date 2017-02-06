'use strict'

/*
 * Stores all IM-Chats and IM-Messanges
 */

import {Store} from 'flux/utils'
import Immutable from 'immutable'

import Dispatcher from '../network/uiDispatcher'
import {getAgentId} from '../session'

let chats = Immutable.Map()

function addIMFromServer (message) {
  const messageBlock = message.MessageBlock.data[0]
  const dialog = messageBlock.Dialog.value

  if (dialog === 41 || dialog === 42) { // filter start/end typing
    return
  }

  const toAgentID = messageBlock.ToAgentID.value
  const fromId = message.AgentData.data[0].AgentID.value

  const msg = Immutable.Map({
    sessionID: message.AgentData.data[0].SessionID.value,
    fromId: fromId,
    fromGroup: messageBlock.FromGroup.value,
    toAgentID: toAgentID,
    parentEstateID: messageBlock.ParentEstateID.value,
    regionID: messageBlock.RegionID.value,
    position: messageBlock.Position.value,
    offline: messageBlock.Offline.value,
    dialog: dialog,
    id: messageBlock.ID.value,
    timestamp: messageBlock.Timestamp.value,
    fromAgentName: fromCharArrayToString(messageBlock.FromAgentName.value),
    message: fromCharArrayToString(messageBlock.Message.value),
    binaryBucket: messageBlock.BinaryBucket.value,
    time: new Date()
  })

  addToChats(fromId, toAgentID, msg)
}

function addIMFromViewer (message) {
  const msg = Immutable.Map({
    sessionID: message.SessionID,
    fromId: message.AgentID,
    fromGroup: message.FromGroup,
    toAgentID: message.ToAgentID,
    parentEstateID: message.ParentEstateID,
    regionID: message.RegionID,
    position: message.Position,
    offline: message.Offline,
    dialog: message.Dialog,
    id: message.ID,
    timestamp: message.Timestamp,
    fromAgentName: message.FromAgentName,
    message: message.Message,
    binaryBucket: message.BinaryBucket,
    time: new Date()
  })

  addToChats(message.AgentID, message.ToAgentID, msg)
}

function addToChats (fromId, toAgentID, msg) {
  // if it is send by this user the conversation will be of the toAgentId
  const conv = (getAgentId() === fromId) ? toAgentID : fromId

  const convStore = chats.has(conv)
    ? chats.get(conv).push(msg)
    : Immutable.List([msg])

  chats = chats.set(conv, convStore)
}

class IMStore extends Store {
  constructor () {
    super(Dispatcher)
  }

  __onDispatch (payload) {
    switch (payload.type) {
      case 'ImprovedInstantMessage':
        addIMFromServer(payload)
        this.__emitChange()
        break
      case 'SelfSendImprovedInstantMessage':
        addIMFromViewer(payload)
        this.__emitChange()
        break
      default:
        break
    }
  }

  getChat () {
    return chats
  }
}

export default new IMStore()

function fromCharArrayToString (buffer) {
  var str = buffer.toString()
  if (str.charCodeAt(str.length - 1) === 0) {
    return str.substring(0, str.length - 1)
  }
  return str
}
