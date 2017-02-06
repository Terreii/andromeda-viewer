'use strict'

/*
 * Stores all IM-Chats and IM-Messanges
 */

import Immutable from 'immutable'

import { getAgentId } from '../session'

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

export default function IMStore (state = Immutable.Map(), action) {
  switch (action.type) {
    case 'ImprovedInstantMessage':
      const msg = action.msg
      if (msg.dialog === 41 || msg.dialog === 42) { // filter start/end typing
        return state
      }
      return addToChats(state, msg.fromId, msg.toAgentID, Immutable.Map(msg))
    case 'SelfSendImprovedInstantMessage':
      return addIMFromViewer(state, action)
    default:
      return state
  }
}
