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
    time: Date.now()
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
    time: time !== 0 ? time : Date.now()
  }
  // If it is a group chat, toAgentID is the Group-UUID.
  IMmsg.chatUUID = IMmsg.fromGroup ? IMmsg.toAgentID : IMmsg.id
  return IMmsg
}

// Gets all messages from the SIM and filters them for the UI
export default function simActionFilter (msg) {
  switch (msg.body.name) {
    case 'ChatFromSimulator':
      const parsed = parseChatFromSimulator(msg.body)
      dispatchSIMAction(msg.body.name, parsed, 'localchat/' + new Date(parsed.time).toJSON())
      break
    case 'ImprovedInstantMessage':
      const parsedMsg = parseIM(msg.body)
      const id = `imChats/${parsedMsg.chatUUID}/${new Date(parsedMsg.time).toJSON()}`
      dispatchSIMAction(msg.body.name, parsedMsg, id)
      break
    default:
      break
  }
}

// Dispatches all parsed messages.
// If they have an ID, they will be saved and synced under the avatar name.
function dispatchSIMAction (name, msg, id) {
  State.dispatch((dispatch, getState, hoodie) => {
    const activeState = getState()
    if (typeof id === 'string' && activeState.account.getIn(['viewerAccount', 'loggedIn'])) {
      // Save messages. They will also be synced!
      const avatarName = activeState.account.get('avatarName')
      msg._id = avatarName + '/' + id
      hoodie.store.add(msg).then(doc => {
        dispatch({
          type: name,
          msg: doc
        })
      })
    } else {
      // This is the path for every message, that will not be synced and saved.
      dispatch({
        type: name,
        msg
      })
    }
  })
}
