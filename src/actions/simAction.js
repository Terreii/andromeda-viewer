import { createNewIMChat } from './chatMessageActions'

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

function parseUUIDNameReply (message) {
  return message.UUIDNameBlock.data.map(nameBlock => {
    const firstName = nullBufferToString(nameBlock.FirstName.value)
    const lastName = nullBufferToString(nameBlock.LastName.value)
    const id = nameBlock.ID.value
    return {
      firstName,
      lastName,
      id
    }
  })
}

function parseUserRights (message, getState) {
  const rights = message.Rights.data.map(user => {
    return {
      agentId: user.AgentRelated.value,
      rights: user.RelatedRights.value
    }
  })
  return {
    ownId: getState().account.get('agentId'),
    fromId: message.AgentData.data[0].AgentID.value,
    userRights: rights
  }
}

function parseRegionInfo (info) {
  const getValues = obj => Object.keys(obj).reduce((all, key) => {
    all[key] = obj[key].value
    return all
  }, {})

  return {
    regionInfo: getValues(info.body.RegionInfo.data[0]),
    regionInfo2: getValues(info.body.RegionInfo2.data[0])
  }
}

// Gets all messages from the SIM and filters them for the UI
function simActionFilter (msg) {
  const name = msg.body.name
  switch (name) {
    case 'ChatFromSimulator':
      const parsed = parseChatFromSimulator(msg.body)
      return dispatchSIMAction(name, parsed, 'localchat/' + new Date(parsed.time).toJSON())

    case 'ImprovedInstantMessage':
      const parsedMsg = parseIM(msg.body)
        // Start a new IMChat.
      return dispatch => {
        dispatch(createNewIMChat(
          parsedMsg.dialog, parsedMsg.chatUUID, parsedMsg.fromId, parsedMsg.fromAgentName
        ))
        const id = `imChats/${parsedMsg.chatUUID}/${new Date(parsedMsg.time).toJSON()}`
        dispatch(dispatchSIMAction(name, parsedMsg, id))
      }

    case 'UUIDNameReply':
      return dispatchSIMAction(name, parseUUIDNameReply(msg.body))

    case 'ChangeUserRights':
      return (dispatch, getState) => {
        dispatch(dispatchSIMAction(name, parseUserRights(msg.body, getState)))
      }

    case 'AgentMovementComplete':
      return dispatchSIMAction(name, {
        position: msg.body.Data.data[0].Position.value,
        lookAt: msg.body.Data.data[0].LookAt.value
      })

    case 'RegionInfo':
      return dispatchSIMAction(name, parseRegionInfo(msg))

    case 'RegionHandshake':
      return sendRegionHandshakeReply(msg)

    default:
      break
  }
}

// Dispatches all parsed messages.
// If they have an ID, they will be saved and synced under the avatar name.
function dispatchSIMAction (name, msg, id) {
  return (dispatch, getState, {hoodie}) => {
    const activeState = getState()
    if (typeof id === 'string' && activeState.account.getIn(['viewerAccount', 'loggedIn'])) {
      // Save messages. They will also be synced!
      const avatarIdentifier = activeState.account.get('avatarIdentifier')
      msg._id = avatarIdentifier + '/' + id
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
  }
}

function sendRegionHandshakeReply (RegionHandshake) {
  return (dispatch, getState, {circuit}) => {
    const regionID = RegionHandshake.body.RegionInfo2.data[0].RegionID.value
    const flags = RegionHandshake.body.RegionInfo.data[0].RegionFlags.value

    const session = getState().session

    circuit.send('RegionHandshakeReply', {
      AgentData: [
        {
          AgentID: session.get('agentId'),
          SessionID: session.get('sessionId')
        }
      ],
      RegionInfo: [
        {
          Flags: flags
        }
      ]
    })

    dispatch({
      type: 'RegionHandshake',
      regionID,
      flags
    })
  }
}

export default function createCallback (dispatch) {
  return msg => {
    const action = simActionFilter(msg)
    if (action != null) { // If the packet is parsed, an action will be dispatched.
      dispatch(action)
    }
  }
}
