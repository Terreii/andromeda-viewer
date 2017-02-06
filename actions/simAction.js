'use strict'

import Dispatcher from '../network/uiDispatcher'
import State from '../stores/state'

const toSendTypes = [ // add here Message-Types that will be processed in the UI
  'ChatFromSimulator',
  'ImprovedInstantMessage'
]

function nullBufferToString (buffy) {
  return buffy.toString('utf8').replace(/\n/gi, '')
}

function parseChatFromSimulator (msg) {
  const chatData = msg.body.ChatData.data[0]
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

// Gets all messages from the SIM and filters them for the UI
export default function simActionFilter (msg) {
  const name = msg.body.name
  if (toSendTypes.includes(name)) {
    let toSendMsg = Object.create(msg.body)
    toSendMsg.type = name
    Dispatcher.dispatch(toSendMsg)
  }
  switch (msg.body.name) {
    case 'ChatFromSimulator':
      const parsedMsg = parseChatFromSimulator(msg)
      State.dispatch({
        type: msg.body.name,
        msg: parsedMsg
      })
      break
    default:
      break
  }
}
