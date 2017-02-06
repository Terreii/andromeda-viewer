'use strict'

/*
 * Stores all IM-Chats and IM-Messanges
 */

import {ReduceStore} from 'flux/utils'
import Immutable from 'immutable'

import Dispatcher from '../network/uiDispatcher'
import {getAgentId} from '../session'

function addIMFromServer (state, message) {
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

  return addToChats(state, fromId, toAgentID, msg)
}

function addIMFromViewer (state, message) {
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

  return addToChats(state, message.AgentID, message.ToAgentID, msg)
}

function addToChats (chats, fromId, toAgentID, msg) {
  // if it is send by this user the conversation will be of the toAgentId
  const conv = (getAgentId() === fromId) ? toAgentID : fromId

  const convStore = chats.has(conv)
    ? chats.get(conv).push(msg)
    : Immutable.List([msg])

  return chats.set(conv, convStore)
}

class IMStore extends ReduceStore {
  getInitialState () {
    return Immutable.Map()
  }

  reduce (state, action) {
    switch (action.type) {
      case 'ImprovedInstantMessage':
        return addIMFromServer(state, action)
      case 'SelfSendImprovedInstantMessage':
        return addIMFromViewer(state, action)
      default:
        return state
    }
  }
}

export default new IMStore(Dispatcher)

function fromCharArrayToString (buffer) {
  var str = buffer.toString()
  if (str.charCodeAt(str.length - 1) === 0) {
    return str.substring(0, str.length - 1)
  }
  return str
}
