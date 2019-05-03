/*
 * Every local chat and IM related action
 */

import { v4 as uuid } from 'uuid'

import { getValueOf, getStringValueOf } from '../network/msgGetters'

import { getShouldSaveChat, getLocalChat, getIMChats } from '../selectors/chat'
import { getIsSignedIn } from '../selectors/viewer'
import { getAvatarDataSaveId, getAgentId, getSessionId } from '../selectors/session'
import { getAvatarNameById, getOwnAvatarName } from '../selectors/names'
import { getRegionId, getParentEstateID, getPosition } from '../selectors/region'

/*
 *
 *  Sending Messages
 *
 */

export function sendLocalChatMessage (text, type, channel) {
  // Sends messages from the local chat
  // No UI update, because the server/sim will send it
  return (dispatch, getState, { circuit }) => {
    const activeState = getState()
    circuit.send('ChatFromViewer', {
      AgentData: [
        {
          AgentID: getAgentId(activeState),
          SessionID: getSessionId(activeState)
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

export function sendInstantMessage (text, to, id, dialog = 0) {
  return async (dispatch, getState, { circuit }) => {
    try {
      const activeState = getState()

      const chat = getIMChats(activeState)[id]

      const agentID = getAgentId(activeState)
      const sessionID = getSessionId(activeState)
      const parentEstateID = getParentEstateID(activeState)
      const regionID = getRegionId(activeState)
      const position = getPosition(activeState)
      const fromAgentName = getOwnAvatarName(activeState).getFullName()
      const binaryBucket = dialog === 17
        ? chat.name
        : Buffer.from([])
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
            Dialog: dialog,
            ID: id,
            Timestamp: Math.floor(time.getTime() / 1000),
            FromAgentName: fromAgentName,
            Message: text,
            BinaryBucket: binaryBucket
          }
        ]
      }, true)

      const chatSaveId = getIMChats(activeState)[id].saveId
      const msg = {
        _id: `${getAvatarDataSaveId(activeState)}/imChats/${chatSaveId}/${time.toJSON()}`,
        chatUUID: id,
        sessionID,
        fromId: agentID,
        fromGroup: false,
        toAgentID: to,
        parentEstateID,
        regionID,
        position,
        offline: 0,
        dialog: dialog,
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
  return (dispatch, getState) => {
    const time = new Date()

    dispatch({
      type: msg.name,
      msg: {
        _id: `${getAvatarDataSaveId(getState())}/localchat/${time.toJSON()}`,

        fromName: getStringValueOf(msg, 'ChatData', 'FromName'),
        sourceID: getValueOf(msg, 'ChatData', 'SourceID'),
        ownerID: getValueOf(msg, 'ChatData', 'OwnerID'),
        sourceType: getValueOf(msg, 'ChatData', 'SourceType'),
        chatType: getValueOf(msg, 'ChatData', 'ChatType'),
        audible: getValueOf(msg, 'ChatData', 'Audible'),
        position: getValueOf(msg, 'ChatData', 'Position'),
        message: getStringValueOf(msg, 'ChatData', 'Message'),
        time: time.getTime()
      }
    })
  }
}

export function saveLocalChatMessages () {
  return async (dispatch, getState, { hoodie }) => {
    const localChat = getLocalChat(getState())
    const messagesToSave = []

    for (let i = localChat.length - 1; i >= 0; i -= 1) {
      const msg = localChat[i]

      if (msg.didSave) {
        break
      } else {
        const toSave = Object.assign({}, msg)
        delete toSave.didSave
        delete toSave.position
        if (toSave.ownerID === toSave.sourceID) {
          // ownerID and source is the same (by normal messages)
          // ownerID is for objects
          delete toSave.ownerID
        }
        messagesToSave.push(toSave)
      }
    }

    if (messagesToSave.length === 0) return

    dispatch({
      type: 'StartSavingLocalChatMessages',
      saving: messagesToSave.map(msg => msg._id)
    })

    const saved = await hoodie.cryptoStore.updateOrAdd(messagesToSave)

    const didError = []

    for (let i = 0; i < saved.length; i += 1) {
      const msg = saved[i]
      if (msg instanceof Error) {
        didError.push(messagesToSave[i]._id)
      }
    }

    dispatch({
      type: 'didSaveLocalChatMessage',
      saved: saved.filter(msg => !didError.includes(msg._id)),
      didError
    })
  }
}

export function deleteOldLocalChat () {
  const maxLocalChatHistory = 200

  return (dispatch, getState, { hoodie }) => {
    const activeState = getState()
    if (!getShouldSaveChat(activeState)) return Promise.resolve()

    const localChat = getLocalChat(activeState)
    if (localChat.length <= maxLocalChatHistory) return Promise.resolve()

    const toDeleteIds = []
    for (let i = 0, max = localChat.length - maxLocalChatHistory; i < max; i += 1) {
      const id = localChat[i]._id

      if (id !== 'messageOfTheDay') {
        toDeleteIds.push(id)
      }
    }

    return hoodie.cryptoStore.remove(toDeleteIds)
  }
}

export function receiveIM (message) {
  return async (dispatch, getState) => {
    const toAgentID = getValueOf(message, 'MessageBlock', 'ToAgentID')
    const fromId = getValueOf(message, 'AgentData', 'AgentID')
    const time = getValueOf(message, 'MessageBlock', 'Timestamp')
    const dialog = getValueOf(message, 'MessageBlock', 'Dialog')
    const fromAgentName = getStringValueOf(message, 'MessageBlock', 'FromAgentName')
    const fromGroup = getValueOf(message, 'MessageBlock', 'FromGroup')

    const IMmsg = {
      _id: '',
      sessionID: getValueOf(message, 'AgentData', 'SessionID'),
      fromId,
      fromGroup,
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
    IMmsg.chatUUID = fromGroup ? IMmsg.toAgentID : IMmsg.id

    if (!(IMmsg.chatUUID in getIMChats(getState()))) {
      // Start a new IMChat.
      const name = dialog === 17
        ? getStringValueOf(message, 'MessageBlock', 'BinaryBucket')
        : fromAgentName
      dispatch(createNewIMChat(dialog, IMmsg.chatUUID, fromId, name))
    }

    const activeState = getState()
    const chatSaveId = getIMChats(activeState)[IMmsg.chatUUID].saveId

    const saveId = getAvatarDataSaveId(activeState)
    IMmsg._id = `${saveId}/imChats/${chatSaveId}/${new Date(IMmsg.time).toJSON()}`

    dispatch({
      type: message.name,
      msg: IMmsg
    })
  }
}

export function saveIMChatMessages () {
  return async (dispatch, getState, { hoodie }) => {
    const unsavedChats = Object.values(getIMChats(getState())).filter(chat => chat.hasUnsavedMSG)

    const chatsToSave = []
    const savingIds = {}
    const saveIdToChatId = {}

    unsavedChats.forEach((chat, key) => {
      const messages = chat.messages

      const ids = []
      savingIds[chat.chatUUID] = ids
      saveIdToChatId[chat.saveId] = chat.chatUUID

      const toSaveMsg = messages.filter(msg => !msg.didSave).map(msg => {
        ids.push(msg._id) // side-effect!

        const dialog = msg.dialog

        let binaryBucket
        switch (dialog) {
          case 0:
          case 13:
          case 14:
          case 15:
          case 16:
          case 17:
          case 18:
            binaryBucket = undefined
            break

          default:
            const theBucket = msg.binaryBucket
            binaryBucket = theBucket != null && theBucket.toJSON().data.length > 1
              ? theBucket
              : undefined
            break
        }

        return {
          _id: msg._id,
          _rev: msg._rev,
          hoodie: msg.hoodie,
          dialog,
          fromId: msg.fromId,
          fromAgentName: msg.fromAgentName,
          message: msg.message,
          time: msg.time,
          binaryBucket
        }
      })

      chatsToSave.push(...toSaveMsg)
    })

    if (chatsToSave.length === 0) return

    dispatch({
      type: 'StartSavingIMMessages',
      chats: savingIds
    })

    const saved = await hoodie.cryptoStore.updateOrAdd(chatsToSave)

    const results = saved.reduce((all, msg, index) => {
      const chatSaveId = chatsToSave[index]._id.split('/')[2]
      const chatUUID = saveIdToChatId[chatSaveId]

      let chat = all[chatUUID]

      if (chat == null) {
        chat = {
          saved: [],
          didError: []
        }
        all[chatUUID] = chat
      }

      if (msg instanceof Error) {
        chat.didError.push(chatsToSave[index]._id)
      } else {
        chat.saved.push(msg)
      }

      return all
    }, {})

    dispatch({
      type: 'didSaveIMMessages',
      chats: results
    })
  }
}

/*
 *
 * Start a new (IM) Chat and load the history
 *
 */

export function getLocalChatHistory (avatarDataSaveId) {
  return (dispatch, getState, { hoodie }) => {
    return hoodie.cryptoStore.withIdPrefix(`${avatarDataSaveId}/localchat/`).findAll()
  }
}

// Start a new IM Chat from the UI or startGroupChat.
export function startNewIMChat (dialog, targetId, name, activate = false) {
  return async (dispatch, getState) => {
    const chatType = getIMChatTypeOfDialog(dialog)
    const chatUUID = calcChatUUID(chatType, targetId, getAgentId(getState()))

    if (chatType === 'personal') {
      try {
        name = getAvatarNameById(getState(), targetId.toString()).getName()
      } catch (error) {
        console.error(error)
      }
    }

    dispatch(createNewIMChat(dialog, chatUUID, targetId, name))
    if (activate) {
      dispatch(activateIMChat(chatUUID))
    }

    return chatUUID
  }
}

// Starts a new IMChat.
function createNewIMChat (dialog, chatUUID, target, name) {
  const type = getIMChatTypeOfDialog(dialog)
  if (type == null) return () => {}

  return (dispatch, getState) => {
    const activeState = getState()

    // Stop if the chat already exists.
    if (chatUUID in getIMChats(activeState)) return

    const saveId = uuid()

    dispatch({
      type: 'CreateNewIMChat',
      _id: `${getAvatarDataSaveId(activeState)}/imChatsInfos/${saveId}`,
      chatType: type,
      chatUUID,
      saveId,
      target,
      name
    })
  }
}

export function activateIMChat (chatUUID) {
  return {
    type: 'ActivateIMChat',
    chatUUID
  }
}

export function saveIMChatInfos () {
  return async (dispatch, getState, { hoodie }) => {
    const chatInfosToSave = Object.values(getIMChats(getState()))
      .filter(chat => !chat.didSaveChatInfo)
      .map(chat => ({
        _id: chat._id,
        chatType: chat.type,
        chatUUID: chat.chatUUID,
        saveId: chat.saveId,
        target: chat.withId,
        name: chat.name
      }))

    if (chatInfosToSave.length === 0) return

    dispatch({
      type: 'startSavingIMChatInfo',
      chatUUIDs: chatInfosToSave.map(chat => chat.chatUUID)
    })

    const result = await hoodie.cryptoStore.findOrAdd(chatInfosToSave)

    const didError = []
    result.forEach((doc, index) => {
      if (doc instanceof Error) {
        didError.push(chatInfosToSave[index].chatUUID)
      }
    })

    dispatch({
      type: 'didSaveIMChatInfo',
      didError
    })
  }
}

// Loads IM Chat Infos.
export function loadIMChats () {
  return (dispatch, getState, { hoodie }) => {
    const activeState = getState()
    // Only load the history if the user is logged into a viewer-account.
    if (!getIsSignedIn(activeState)) return

    const avatarDataSaveId = getAvatarDataSaveId(activeState)
    const store = hoodie.cryptoStore.withIdPrefix(`${avatarDataSaveId}/imChatsInfos/`)
    store.findAll().then(result => {
      dispatch({
        type: 'IMChatInfosLoaded',
        chats: result
      })
    })

    // if the syncing didn't finish and new chat infos are loaded
    const handler = doc => {
      dispatch({
        type: 'IMChatInfosLoaded',
        chats: [doc]
      })
    }
    store.on('add', handler)
    hoodie.one('avatarDidLogout', () => {
      store.off('add', handler)
    })
  }
}

// Loads messages of an IM Chat.
export function getIMHistory (chatUUID, chatSaveId) {
  return async (dispatch, getState, { hoodie }) => {
    dispatch({
      type: 'IMHistoryStartLoading',
      chatUUID
    })

    const activeState = getState()
    const chatSavePrefix = `${getAvatarDataSaveId(activeState)}/imChats/${chatSaveId}`

    const chat = getIMChats(activeState)[chatUUID]
    // get the _id of the oldest loaded msg
    const hasAMessage = chat.messages.length > 0
    const firstMsgId = hasAMessage
      ? chat.messages[0]._id
      : (chatSavePrefix + '/\uFFFF') // or one with a special id that is always the last

    try {
      // using PouchDB -> https://pouchdb.com/api.html#batch_fetch
      const idsResult = await hoodie.store.db.allDocs({
        startkey: firstMsgId,
        endkey: chatSavePrefix,
        limit: hasAMessage ? 101 : 100, // 100 + last
        descending: true
      })

      const ids = idsResult.rows
        .map(row => row.id)
        .reverse()
        .filter(id => id !== firstMsgId)

      if (ids.length === 0) {
        dispatch({
          type: 'IMHistoryLoaded',
          chatUUID,
          messages: [],
          didLoadAll: true
        })
        return
      }

      const messages = await hoodie.cryptoStore.find(ids)

      dispatch({
        type: 'IMHistoryLoaded',
        chatUUID,
        messages,
        didLoadAll: messages.length < 100
      })
    } catch (err) {
      if (err.message === 'database is destroyed') {
        // handle destroyed DB
        const docs = await hoodie.cryptoStore.withIdPrefix(chatSavePrefix).findAll()

        const endIndex = firstMsgId.endsWith('\uFFFF')
          ? docs.length
          : docs.findIndex(doc => doc._id === firstMsgId)

        const startIndex = Math.max(0, endIndex - 100)
        const messages = docs.slice(startIndex, endIndex)

        dispatch({
          type: 'IMHistoryLoaded',
          chatUUID,
          messages,
          didLoadAll: messages.length === 0
        })
      } else {
        dispatch({
          type: 'IMHistoryLoaded',
          chatUUID,
          message: [],
          didLoadAll: false
        })
      }
    }
  }
}

/*
 *
 * Helper functions
 *
 */

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
  } else if (type === 'group' || type === 'conference') {
    return targetId
  } else {
    throw new Error(`Chat type '${type}' not jet supported!`)
  }
}

// Get the chatType stored in an IMChat Info from the dialog value in IMs.
export function getIMChatTypeOfDialog (dialog) {
  switch (dialog) {
    case 0:
      return 'personal'
    case 15:
      return 'group' // session with a group
    case 13:
    case 14:
    case 16:
    case 17:
      return 'conference' // session with multiple people
    default:
      return undefined
  }
}
