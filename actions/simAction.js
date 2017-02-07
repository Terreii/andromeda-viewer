'use strict'

import State from '../stores/state'

function nullBufferToString (buffy) {
  return buffy.toString('utf8').replace(/\0/gi, '')
}

function parseChatFromSimulator (msg) {
  const chatData = msg.ChatData.data[0]
  const chatMsg = {
    fromName: nullBufferToString(chatData.FromName.value),
    sourceID: chatData.SourceID.value,
    ownerID: chatData.OwnerID.value,
    sourceType: chatData.SourceType.value,
    chatType: chatData.ChatType.value,
    audible: chatData.Audible.value,
    position: chatData.Position.value,
    message: nullBufferToString(chatData.Message.value),
    time: new Date()
  }
  return chatMsg
}

function parseIM (message) {
  const messageBlock = message.MessageBlock.data[0]

  const toAgentID = messageBlock.ToAgentID.value
  const fromId = message.AgentData.data[0].AgentID.value
  const time = messageBlock.Timestamp.value

  const IMmsg = {
    sessionID: message.AgentData.data[0].SessionID.value,
    fromId: fromId,
    fromGroup: messageBlock.FromGroup.value,
    toAgentID: toAgentID,
    parentEstateID: messageBlock.ParentEstateID.value,
    regionID: messageBlock.RegionID.value,
    position: messageBlock.Position.value,
    offline: messageBlock.Offline.value,
    dialog: messageBlock.Dialog.value,
    id: messageBlock.ID.value,
    fromAgentName: nullBufferToString(messageBlock.FromAgentName.value),
    message: nullBufferToString(messageBlock.Message.value),
    binaryBucket: messageBlock.BinaryBucket.value,
    time: time !== 0 ? new Date(time) : new Date()
  }
  return IMmsg
}

// Gets all messages from the SIM and filters them for the UI
export default function simActionFilter (msg) {
  switch (msg.body.name) {
    case 'ChatFromSimulator':
      dispatch(msg, parseChatFromSimulator)
      break
    case 'ImprovedInstantMessage':
      dispatch(msg, parseIM)
      break
    default:
      break
  }
}

function dispatch (msg, fn) {
  const parsedMsg = fn(msg.body)
  State.dispatch({
    type: msg.body.name,
    msg: parsedMsg
  })
}
