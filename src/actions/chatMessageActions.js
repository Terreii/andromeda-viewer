/*
 * Every local chat and IM related action
 */

import {getValueOf, getStringValueOf} from '../network/msgGetters'

/*
 *
 *  Sending Messages
 *
 */

export function sendLocalChatMessage (text, type, channel) {
  // Sends messages from the localchat
  // No UI update, because the server/sim will send it
  return (dispatch, getState, {circuit}) => {
    const session = getState().session
    circuit.send('ChatFromViewer', {
      AgentData: [
        {
          AgentID: session.get('agentId'),
          SessionID: session.get('sessionId')
        }
      ],
      ChatData: [
        {
          Message: text,
          Type: type,
          Channel: channel
        }
      ]
    }, true)
  }
}

export function sendInstantMessage (text, to, id) {
  return async (dispatch, getState, {hoodie, circuit}) => {
    try {
      const activeState = getState()
      const session = activeState.session

      const agentID = session.get('agentId')
      const sessionID = session.get('sessionId')
      const parentEstateID = session.getIn(['regionInfo', 'ParentEstateID'])
      const regionID = session.getIn(['regionInfo', 'regionID'])
      const position = session.getIn(['position', 'position'])
      const fromAgentName = activeState.names.getIn(['names', agentID]).getFullName()
      const binaryBucket = Buffer.from([])
      const time = new Date()

      circuit.send('ImprovedInstantMessage', {
        AgentData: [
          {
            AgentID: agentID,
            SessionID: sessionID
          }
        ],
        MessageBlock: [
          {
            FromGroup: false,
            ToAgentID: to,
            ParentEstateID: parentEstateID,
            RegionID: regionID,
            Position: position,
            Offline: 0,
            Dialog: 0,
            ID: id,
            Timestamp: Math.floor(time.getTime() / 1000),
            FromAgentName: fromAgentName,
            Message: text,
            BinaryBucket: binaryBucket
          }
        ]
      }, true)

      const avatarName = activeState.account.get('avatarName')
      const msg = {
        _id: `${avatarName}/imChats/${id}/${time.toJSON()}`,
        chatUUID: id,
        sessionID,
        fromId: agentID,
        fromGroup: false,
        toAgentID: to,
        parentEstateID,
        regionID,
        position,
        offline: 0,
        dialog: 0,
        id,
        fromAgentName,
        message: text,
        binaryBucket,
        time: time.getTime()
      }
      const actionData = {
        type: 'SelfSendImprovedInstantMessage',
        msg
      }

      if (shouldSaveChat(activeState)) {
        await hoodie.store.add(msg)
      }
      dispatch(actionData)
    } catch (e) {
      console.error(e)
    }
  }
}

/*
 *
 *  Receiving messages
 *
 */

export function receiveChatFromSimulator (msg) {
  const chatMsg = {
    fromName: getStringValueOf(msg, 'ChatData', 'FromName'),
    sourceID: getValueOf(msg, 'ChatData', 'SourceID'),
    ownerID: getValueOf(msg, 'ChatData', 'OwnerID'),
    sourceType: getValueOf(msg, 'ChatData', 'SourceType'),
    chatType: getValueOf(msg, 'ChatData', 'ChatType'),
    audible: getValueOf(msg, 'ChatData', 'Audible'),
    position: getValueOf(msg, 'ChatData', 'Position'),
    message: getStringValueOf(msg, 'ChatData', 'Message'),
    time: Date.now()
  }

  return dispatchChatAction(msg.name, chatMsg, 'localchat/' + new Date(chatMsg.time).toJSON())
}

export function receiveIM (message) {
  return async dispatch => {
    const toAgentID = getValueOf(message, 'MessageBlock', 'ToAgentID')
    const fromId = getValueOf(message, 'AgentData', 'AgentID')
    const time = getValueOf(message, 'MessageBlock', 'Timestamp')
    const dialog = getValueOf(message, 'MessageBlock', 'Dialog')
    const fromAgentName = getStringValueOf(message, 'MessageBlock', 'FromAgentName')

    const IMmsg = {
      sessionID: getValueOf(message, 'AgentData', 'SessionID'),
      fromId,
      fromGroup: getValueOf(message, 'MessageBlock', 'FromGroup'),
      toAgentID,
      parentEstateID: getValueOf(message, 'MessageBlock', 'ParentEstateID'),
      regionID: getValueOf(message, 'MessageBlock', 'RegionID'),
      position: getValueOf(message, 'MessageBlock', 'Position'),
      offline: getValueOf(message, 'MessageBlock', 'Offline'),
      dialog,
      id: getValueOf(message, 'MessageBlock', 'ID'),
      fromAgentName,
      message: getStringValueOf(message, 'MessageBlock', 'Message'),
      binaryBucket: getValueOf(message, 'MessageBlock', 'BinaryBucket'),
      time: time !== 0 ? time * 1000 : Date.now()
    }

    // If it is a group chat, toAgentID is the Group-UUID.
    IMmsg.chatUUID = IMmsg.fromGroup ? IMmsg.toAgentID : IMmsg.id

    // Start a new IMChat.
    await dispatch(createNewIMChat(dialog, IMmsg.chatUUID, fromId, fromAgentName))

    const id = `imChats/${IMmsg.chatUUID}/${new Date(IMmsg.time).toJSON()}`
    dispatch(dispatchChatAction(message.name, IMmsg, id))
  }
}

// Dispatches chat (and IM) messages.
// They will be saved and synced under the avatar name.
function dispatchChatAction (name, msg, id) {
  return async (dispatch, getState, {hoodie}) => {
    const activeState = getState()

    if (shouldSaveChat(activeState)) {
      // Save messages. They will also be synced!
      msg._id = activeState.account.get('avatarIdentifier') + '/' + id

      const doc = await hoodie.store.add(msg)
      dispatch({
        type: name,
        msg: doc
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

/*
 *
 * Start a new (IM) Chat and load the history
 *
 */

export function getLocalChatHistory (avatarIdentifier) {
  return (dispatch, getState, {hoodie}) => {
    return hoodie.store.withIdPrefix(`${avatarIdentifier}/localchat/`).findAll()
  }
}

// Start a new IM Chat from the UI.
export function startNewIMChat (dialog, targetId, name) {
  return async (dispatch, getState, {hoodie}) => {
    const chatType = getIMChatTypeOfDialog(dialog)
    const chatUUID = calcChatUUID(chatType, targetId, getState().account.get('agentId'))

    if (chatType === 'personal') {
      try {
        name = getState().names.getIn(['names', targetId.toString()]).getName()
      } catch (error) {
        console.error(error)
      }
    }

    await dispatch(createNewIMChat(dialog, chatUUID, targetId, name))

    return chatUUID
  }
}

// Starts a new IMChat. It also saves it into Hoodie.
function createNewIMChat (dialog, chatUUID, target, name) {
  const type = getIMChatTypeOfDialog(dialog)
  if (type == null) return () => {}

  return (dispatch, getState, {hoodie}) => {
    const activeState = getState()
    const hasChat = activeState.IMs.has(chatUUID)
    // Stop if the chat already exists.
    if (hasChat && activeState.IMs.getIn([chatUUID, 'active'])) return

    dispatch({
      type: 'CreateNewIMChat',
      chatType: type,
      chatUUID,
      target,
      name
    })

    // If the user is logged in with a viewer-account, then save the IMChat.
    if (hasChat || !shouldSaveChat(activeState)) return
    const avatarIdentifier = activeState.account.get('avatarIdentifier')
    const doc = {
      _id: `${avatarIdentifier}/imChatsInfos/${chatUUID}`,
      chatType: type,
      chatUUID,
      target,
      name
    }
    return hoodie.store.findOrAdd(doc)
  }
}

// Loads IM Chat Infos.
export function loadIMChats () {
  return (dispatch, getState, {hoodie}) => {
    const activeState = getState()
    // Only load the history if the user is logged into a viewer-account.
    if (!activeState.account.getIn(['viewerAccount', 'loggedIn'])) return

    const avatarIdentifier = activeState.account.get('avatarIdentifier')
    hoodie.store.withIdPrefix(`${avatarIdentifier}/imChatsInfos/`).findAll().then(result => {
      dispatch({
        type: 'IMChatInfosLoaded',
        chats: result
      })
    })
  }
}

// Loads messages of an IM Chat.
export function getIMHistory (chatUUID) {
  return (dispatch, getState, {hoodie}) => {
    dispatch({
      type: 'IMHistoryStartLoading',
      chatUUID
    })
    const avatarIdentifier = getState().account.get('avatarIdentifier')
    hoodie.store.withIdPrefix(`${avatarIdentifier}/imChats/${chatUUID}`).findAll().catch(err => {
      if (err.status === 404) {
        return []
      }
      throw err
    }).then(docs => {
      dispatch({
        type: 'IMHistoryLoaded',
        chatUUID,
        messages: docs
      })
    })
  }
}

/*
 *
 * Helper functions
 *
 */

// checks if the chat history should be saved and synced
function shouldSaveChat (activeState) {
  return activeState.account.getIn(['viewerAccount', 'loggedIn']) &&
    activeState.account.get('sync')
}

// UUID make structure: 00000000-0000-4000-x000-000000000000
// all are hexadecimal numbers.
// 4 is always 4 and x is between 8 and b, but only if correct == true
// XOR of IM-chats isn't a correct UUID.
function uuidXOR (idIn1, idIn2, correct = false) {
  const id1 = idIn1.toString().replace(/-/gi, '')
  const id2 = idIn2.toString().replace(/-/gi, '')

  let out = ''
  for (let i = 0; i < 16; ++i) {
    const index = i * 2
    const byte1 = parseInt(id1[index] + id1[index + 1], 16)
    const byte2 = parseInt(id2[index] + id2[index + 1], 16)

    let xorByte = byte1 ^ byte2
    if (correct && i === 6) { // Makes the 4 in the UUID
      xorByte = (0b00001111 & xorByte) | (4 << 4)
    } else if (correct && i === 8) { // Makes the x in the UUID. It is between 8 and b
      xorByte = (8 << 4) + (0b00111111 & xorByte)
    }

    if (i === 4 || i === 6 || i === 8 || i === 10) {
      out += '-'
    }
    out += xorByte.toString(16).padStart(2, '0')
  }
  return out
}

// Create a new chatUUID from type, target-UUID & agentUUID
function calcChatUUID (type, targetId, agentId) {
  if (type === 'personal') {
    return uuidXOR(agentId, targetId)
  } else {
    throw new Error(`Chat type '${type}' not jet supported!`)
  }
}

// Get the chatType stored in an IMChat Info from the dialog value in IMs.
export function getIMChatTypeOfDialog (dialog) {
  switch (dialog) {
    case 0:
      return 'personal'
    default:
      return undefined
  }
}
