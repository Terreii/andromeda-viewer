/*
 * Every local chat and IM related action
 */

import { v4 as uuid } from 'uuid'

import { UUID as LLUUID } from '../llsd'
import { getValueOf, getStringValueOf } from '../network/msgGetters'

import { getShouldSaveChat, getLocalChat, getIMChats } from '../selectors/chat'
import { getIsSignedIn } from '../selectors/viewer'
import { getAvatarDataSaveId, getAgentId, getSessionId } from '../selectors/session'
import { getAvatarNameById, getOwnAvatarName } from '../selectors/names'
import { getGroupsIDs } from '../selectors/groups'
import { getRegionId, getParentEstateID, getPosition } from '../selectors/region'

import { Maturity } from '../types/viewer'
import {
  IMDialog,
  IMChatType,
  NotificationTypes,
  LocalChatSourceType,
  LocalChatType,
  LocalChatAudible
} from '../types/chat'

export function changeTab (newTab) {
  return {
    type: 'CHAT_TAB_CHANGED',
    key: newTab
  }
}

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

/**
 * Send a InstantMessage.
 * This can be to a personal, group or conference session.
 * @param {string} text Message body to send.
 * @param {string} to ID of the receiver.
 * @param {string} id ID of the session.
 * @param {IMDialog} dialog Type of the message.
 */
export function sendInstantMessage (text, to, id, dialog = IMDialog.MessageFromAgent) {
  return async (dispatch, getState, { circuit }) => {
    const activeState = getState()

    const { name, type } = getIMChats(activeState)[id]

    const msg = {
      AgentData: [
        {
          AgentID: getAgentId(activeState),
          SessionID: getSessionId(activeState)
        }
      ],
      MessageBlock: [
        {
          FromGroup: false,
          ToAgentID: to,
          ParentEstateID: getParentEstateID(activeState),
          RegionID: getRegionId(activeState),
          Position: getPosition(activeState),
          Offline: 0,
          Dialog: dialog,
          ID: id,
          Timestamp: Math.floor(Date.now() / 1000),
          FromAgentName: getOwnAvatarName(activeState).getFullName(),
          Message: text,
          BinaryBucket: dialog === IMDialog.SessionSend
            ? name
            : Buffer.from([])
        }
      ]
    }

    await circuit.send('ImprovedInstantMessage', msg, true)

    switch (type) {
      case IMChatType.personal:
        dispatch(handleIM(msg))
        break

      case IMChatType.group:
        dispatch(handleGroupIM(msg))
        break

      case IMChatType.conference:
        dispatch(handleConferenceIM(msg))
        break

      default:
        throw new TypeError('Unknown chat type!')
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
      type: 'CHAT_FROM_SIMULATOR_RECEIVED',
      msg: {
        _id: `${getAvatarDataSaveId(getState())}/localchat/${time.toJSON()}`,

        fromName: getStringValueOf(msg, 'ChatData', 'FromName'),
        fromId: getValueOf(msg, 'ChatData', 'SourceID'),
        ownerId: getValueOf(msg, 'ChatData', 'OwnerID'),
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
        messagesToSave.push({
          ...msg,
          // Save as text. Because text has meaning.
          sourceType: LocalChatSourceType[msg.sourceType].toLowerCase(),
          chatType: LocalChatType[msg.chatType].toLowerCase(),
          audible: LocalChatAudible[msg.audible].toLowerCase(),
          // ownerId and sourceId (fromId) is the same (by normal messages)
          // ownerId is for objects
          ownerId: msg.ownerId === msg.fromId
            ? undefined // remove ownerId if the msg is from an avatar
            : msg.ownerId,
          // add all fields that shouldn't be saved after this line
          didSave: undefined,
          position: undefined
        })
      }
    }

    if (messagesToSave.length === 0) return

    dispatch({
      type: 'SAVING_LOCAL_CHAT_MESSAGES_START',
      saving: messagesToSave.map(msg => msg._id)
    })

    const saved = await hoodie.cryptoStore.updateOrAdd(messagesToSave)

    const didSave = []
    const didError = []

    const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

    saved.forEach((msg, index) => {
      if (msg instanceof Error) {
        didError.push(messagesToSave[index]._id)
      } else {
        // Transform text form back to int/enum
        msg.chatType = LocalChatType[capitalize(msg.chatType)]
        msg.sourceType = LocalChatSourceType[capitalize(msg.sourceType)]
        msg.audible = LocalChatAudible[capitalize(msg.audible)]

        didSave.push(msg)
      }
    })

    dispatch({
      type: 'DID_SAVE_LOCAL_CHAT_MESSAGE',
      saved: didSave,
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

/**
 * Send a request to retrieve instant messages (IM) that
 * where send while the avatar was offline.
 */
export function retrieveInstantMessages () {
  return (dispatch, getState, { circuit }) => {
    const state = getState()

    circuit.send('RetrieveInstantMessages', {
      AgentData: [
        {
          AgentID: getAgentId(state),
          SessionID: getSessionId(state)
        }
      ]
    }, true)
  }
}

export function receiveIM (message) {
  return (dispatch, getState) => {
    const state = getState()
    const id = getValueOf(message, 'MessageBlock', 'ID')
    const dialog = getValueOf(message, 'MessageBlock', 'Dialog')
    const fromAgentName = getStringValueOf(message, 'MessageBlock', 'FromAgentName')
    const fromId = getValueOf(message, 'AgentData', 'AgentID')

    switch (dialog) {
      case IMDialog.SessionSend:
        if (getGroupsIDs(state).includes(id)) {
          dispatch(handleGroupIM(message))
        } else {
          dispatch(handleConferenceIM(message))
        }
        break

      case IMDialog.MessageFromAgent:
        if (fromAgentName === 'Second Life' && id in getIMChats(state)) {
          dispatch(handleSystemMessageToIM(message))
        } else if (fromAgentName === 'Second Life') {
          dispatch(handleIMFromObject(message))
        } else if (fromId === LLUUID.nil) {
          dispatch(handleSystemNotification(message))
        } else if (
          getValueOf(message, 'MessageBlock', 'FromGroup') ||
          getGroupsIDs(state).includes(id)
        ) {
          dispatch(handleGroupIM(message))
        } else if (getValueOf(message, 'MessageBlock', 'BinaryBucket').length > 1) {
          dispatch(handleConferenceIM(message))
        } else if (id === LLUUID.nil) {
          const text = getStringValueOf(message, 'MessageBlock', 'Message')
          dispatch(handleNotificationInChat(text, fromAgentName, fromId))
        } else {
          dispatch(handleIM(message))
        }
        break

      case IMDialog.BusyAutoResponse:
        dispatch(handleBusyAutoResponse(message))
        break

      case IMDialog.MessageFromObject:
        dispatch(handleIMFromObject(message))
        break

      case IMDialog.StartTyping:
      case IMDialog.StopTyping:
        dispatch(handleIMTypingEvent(message))
        break

      case IMDialog.MessageBox:
      case IMDialog.FromTaskAsAlert:
        dispatch(handleTextOnlyNotification(
          getStringValueOf(message, 'MessageBlock', 'Message'),
          fromAgentName
        ))
        break

      case IMDialog.GotoUrl:
        dispatch(handleGoToURL(message))
        break

      case IMDialog.TeleportLureOffered:
      case IMDialog.GodLikeTeleportLureOffered:
        dispatch(handleTeleportOffers(message))
        break

      case IMDialog.RequestTeleportLure:
        dispatch(handleRequestTeleportLure(message))
        break

      case IMDialog.GroupInvitation:
        dispatch(handleGroupInvite(message))
        break

      case IMDialog.GroupNotice:
        dispatch(handleGroupNotice(message))
        break

      case IMDialog.FriendshipOffered:
        if (fromAgentName === 'Second Life') {
          dispatch(handleIMFromObject(message))
        } else {
          dispatch(handleFriendshipOffer(message))
        }
        break

      case IMDialog.FriendshipAccepted:
      case IMDialog.FriendshipDeclined:
        {
          const acceptedText = dialog === IMDialog.FriendshipAccepted ? 'accepted' : 'declined'
          dispatch(handleNotificationInChat(
            `${acceptedText} your friendship offer.`,
            fromAgentName,
            fromId
          ))
        }
        break

      case IMDialog.InventoryOffered:
        dispatch(handleInventoryOffer(message))
        break

      case IMDialog.TaskInventoryOffered:
        dispatch(handleInventoryOffer(message))
        break

      case IMDialog.InventoryAccepted:
      case IMDialog.InventoryDeclined:
        {
          const acceptedText = dialog === IMDialog.InventoryAccepted ? 'accepted' : 'declined'
          dispatch(handleNotificationInChat(
            `${acceptedText} your inventory offer.`,
            fromAgentName,
            fromId
          ))
        }
        break

      default:
        console.warn(`Unhandled IM! Dialog: ${getValueOf(message, 'MessageBlock', 'Dialog')}`)
        break
    }
  }
}

/**
 * Handles a direct IM.
 * @param {object} msg IM Message from the server
 */
function handleIM (msg) {
  return (dispatch, getState) => {
    const state = getState()

    const id = getValueOf(msg, 'MessageBlock', 'ID')
    const fromAgentId = getValueOf(msg, 'AgentData', 'AgentID')
    const fromAgentName = getStringValueOf(msg, 'MessageBlock', 'FromAgentName')
    const avatarSaveId = getAvatarDataSaveId(state)

    const time = new Date()
    const timeStamp = +getValueOf(msg, 'MessageBlock', 'Timestamp')
    if (timeStamp !== 0) {
      time.setTime(timeStamp * 1000)
    }

    let chat = getIMChats(state)[id]
    if (chat == null) {
      dispatch(createNewIMChat(IMChatType.personal, id, fromAgentId, fromAgentName))

      chat = getIMChats(getState())[id]
    }

    dispatch({
      type: 'PERSONAL_IM_RECEIVED',
      sessionId: id,
      msg: {
        _id: `${avatarSaveId}/imChats/${chat.saveId}/${time.toJSON()}`,
        fromName: fromAgentName,
        fromId: fromAgentId,
        offline: getValueOf(msg, 'MessageBlock', 'Offline'),
        message: getStringValueOf(msg, 'MessageBlock', 'Message'),
        time: time.getTime()
      }
    })
  }
}

/**
 * Handles messages to Group chats
 * @param {object} msg IM Message from the server
 */
function handleGroupIM (msg) {
  return (dispatch, getState) => {
    const state = getState()

    const id = getValueOf(msg, 'MessageBlock', 'ID')
    const time = new Date()
    const timeStamp = +getValueOf(msg, 'MessageBlock', 'Timestamp')
    if (timeStamp !== 0) {
      time.setTime(timeStamp * 1000)
    }
    const chat = getIMChats(state)[id]

    // Group chat will be started by the group reactors.
    if (chat == null) {
      throw new Error(`chat for group ${id} doesn't exist!`)
    }

    dispatch({
      type: 'GROUP_IM_RECEIVED',
      groupId: id,
      msg: {
        _id: `${getAvatarDataSaveId(state)}/imChats/${chat.saveId}/${time.toJSON()}`,
        fromName: getStringValueOf(msg, 'MessageBlock', 'FromAgentName'),
        fromId: getValueOf(msg, 'AgentData', 'AgentID'),
        message: getStringValueOf(msg, 'MessageBlock', 'Message'),
        time: time.getTime()
      }
    })
  }
}

/**
 * Handles messages send to a conference of multiple peoples
 * @param {object} msg IM Message from the server
 */
function handleConferenceIM (msg) {
  return (dispatch, getState) => {
    const state = getState()

    const id = getValueOf(msg, 'MessageBlock', 'ID')
    const avatarSaveId = getAvatarDataSaveId(state)
    const time = new Date()
    const timeStamp = +getValueOf(msg, 'MessageBlock', 'Timestamp')
    if (timeStamp !== 0) {
      time.setTime(timeStamp * 1000)
    }

    let chat = getIMChats(state)[id]
    if (chat == null) {
      dispatch(createNewIMChat(
        IMChatType.conference,
        id,
        id,
        getStringValueOf(msg, 'MessageBlock', 'BinaryBucket')
      ))

      chat = getIMChats(getState())[id]
    }

    dispatch({
      type: 'CONFERENCE_IM_RECEIVED',
      conferenceId: id,
      msg: {
        _id: `${avatarSaveId}/imChats/${chat.saveId}/${time.toJSON()}`,
        fromName: getStringValueOf(msg, 'MessageBlock', 'FromAgentName'),
        fromId: getValueOf(msg, 'AgentData', 'AgentID'),
        message: getStringValueOf(msg, 'MessageBlock', 'Message'),
        time: time.getTime()
      }
    })
  }
}

/**
 * Handles busy auto responses
 * @param {object} msg IM Message from the server
 */
function handleBusyAutoResponse (msg) {
  return (dispatch, getState) => {
    const state = getState()

    const id = getValueOf(msg, 'MessageBlock', 'ID')

    const chat = getIMChats(state)[id]
    if (chat == null || chat.type !== IMChatType.personal) return

    const avatarSaveId = getAvatarDataSaveId(state)
    const time = new Date()

    dispatch({
      type: 'BUSY_AUTO_RESPONSE_RECEIVED',
      sessionId: id,
      msg: {
        _id: `${avatarSaveId}/imChats/${chat.saveId}/${time.toJSON()}`,
        fromName: getStringValueOf(msg, 'MessageBlock', 'FromAgentName'),
        fromId: getValueOf(msg, 'AgentData', 'AgentID'),
        offline: getValueOf(msg, 'MessageBlock', 'Offline'),
        message: getStringValueOf(msg, 'MessageBlock', 'Message'),
        time: time.getTime()
      }
    })
  }
}

/**
 * Handle Messages from the system to a IM session.
 * @param {object} msg IM Message from the server
 */
function handleSystemMessageToIM (msg) {
  return (dispatch, getState) => {
    const state = getState()

    const id = getValueOf(msg, 'MessageBlock', 'ID')

    const chat = getIMChats(state)[id]
    if (chat == null) return

    const time = new Date()

    dispatch({
      type: 'SYSTEM_IM_RECEIVED',
      sessionId: id,
      msg: {
        _id: `${getAvatarDataSaveId(state)}/imChats/${chat.saveId}/${time.toJSON()}`,
        fromName: getStringValueOf(msg, 'MessageBlock', 'FromAgentName') || 'Second Life',
        fromId: LLUUID.nil,
        offline: getValueOf(msg, 'MessageBlock', 'Offline'),
        message: getStringValueOf(msg, 'MessageBlock', 'Message'),
        time: time.getTime()
      }
    })
  }
}

/**
 * Handles messages from Objects
 * @param {object} msg IM Message from the server
 */
function handleIMFromObject (msg) {
  // TODO: add handling of muted objects (+ their owners)

  return {
    type: 'NOTIFICATION_IN_CHAT_ADDED',
    text: getStringValueOf(msg, 'MessageBlock', 'Message'),
    fromName: getStringValueOf(msg, 'MessageBlock', 'FromAgentName'),
    ownerId: getValueOf(msg, 'AgentData', 'AgentID'),
    objectId: getValueOf(msg, 'MessageBlock', 'ID'),
    slurl: getStringValueOf(msg, 'MessageBlock', 'BinaryBucket'),
    time: Date.now()
  }
}

/**
 * Handle text only notifications.
 * @param {string} text Text that should be displayed.
 */
function handleTextOnlyNotification (text, fromName) {
  return notificationActionCreator({
    notificationType: NotificationTypes.TextOnly,
    fromName: fromName.toString(),
    text: text.toString()
  })
}

/**
 * Handle an System message.
 * @param {object} msg IM from the sim.
 */
function handleSystemNotification (msg) {
  return notificationActionCreator({
    notificationType: NotificationTypes.System,
    text: getStringValueOf(msg, 'MessageBlock', 'Message')
  })
}

/**
 * Handles friendship offers by IM.
 * @param {object} msg IM Message from the server
 */
function handleFriendshipOffer (msg) {
  return notificationActionCreator({
    notificationType: NotificationTypes.FriendshipOffer,
    text: getStringValueOf(msg, 'MessageBlock', 'Message'),
    fromId: getValueOf(msg, 'AgentData', 'AgentID'),
    fromName: getStringValueOf(msg, 'MessageBlock', 'FromAgentName'),
    sessionId: getValueOf(msg, 'MessageBlock', 'ID')
  })
}

/**
 * handles Group invitations.
 * @param {object} msg IM Message from the server
 */
function handleGroupInvite (msg) {
  const id = getValueOf(msg, 'MessageBlock', 'ID')
  const binaryBucket = getValueOf(msg, 'MessageBlock', 'BinaryBucket')

  return notificationActionCreator({
    notificationType: NotificationTypes.GroupInvitation,
    text: getStringValueOf(msg, 'MessageBlock', 'Message'),
    fee: binaryBucket.readUInt32BE(0),
    roleId: new LLUUID(Array.from(binaryBucket.slice(4))).toString(),
    groupId: getValueOf(msg, 'AgentData', 'AgentID'),
    transactionId: id,
    name: 'Tester',
    useOfflineCap: id === LLUUID.nil && !getValueOf(msg, 'MessageBlock', 'Offline')
  })
}

/**
 * Handles group notifications.
 * @param {object} msg IM Message from the server
 */
function handleGroupNotice (msg) {
  const message = getStringValueOf(msg, 'MessageBlock', 'Message')
  const sepIndex = message.indexOf('|')

  const binaryBucket = getValueOf(msg, 'MessageBlock', 'BinaryBucket')
  const hasInventoryOffer = binaryBucket.readUInt8(0) !== 0

  if (binaryBucket.length < 18) throw new Error('BinaryBucket of GroupNotice is to small!')
  const groupIdBuffer = binaryBucket.slice(2, 18)
  const groupId = new LLUUID(Array.from(groupIdBuffer)).toString()

  const body = {
    notificationType: NotificationTypes.GroupNotice,
    title: message.slice(0, sepIndex),
    text: message.slice(sepIndex + 1),
    groupId,
    senderName: getStringValueOf(msg, 'MessageBlock', 'FromAgentName'),
    senderId: getValueOf(msg, 'AgentData', 'AgentID'),
    time: Date.now(),
    item: null
  }

  if (hasInventoryOffer) {
    const assetType = binaryBucket.readUInt8(1)
    const itemName = binaryBucket.slice(18).toString('utf8').replace('\0', '')
    const id = getValueOf(msg, 'MessageBlock', 'ID')

    body.item = {
      name: itemName,
      type: assetType,
      transactionId: id
    }
  }

  return notificationActionCreator(body)
}

/**
 * Handles GoTo URL notifications.
 * @param {object} msg IM Message from the server
 */
function handleGoToURL (msg) {
  return notificationActionCreator({
    notificationType: NotificationTypes.LoadURL,
    text: getStringValueOf(msg, 'MessageBlock', 'Message'),
    url: new URL(getStringValueOf(msg, 'MessageBlock', 'BinaryBucket')),
    fromId: getValueOf(msg, 'AgentData', 'AgentID'),
    fromName: getStringValueOf(msg, 'MessageBlock', 'FromAgentName')
  })
}

/**
 * Handles an request for to be teleported.
 * @param {object} msg IM Message from the server
 */
function handleRequestTeleportLure (msg) {
  return notificationActionCreator({
    notificationType: NotificationTypes.RequestTeleportLure,
    text: getStringValueOf(msg, 'MessageBlock', 'Message'),
    fromId: getValueOf(msg, 'AgentData', 'AgentID'),
    fromName: getStringValueOf(msg, 'MessageBlock', 'FromAgentName')
  })
}

/**
 * Handles TeleportLureOffered and GodLikeTeleportLureOffered.
 * @param {object} msg IM Message from the server
 */
function handleTeleportOffers (msg) {
  const regionInfo = getStringValueOf(msg, 'MessageBlock', 'BinaryBucket')
  const [gX, gY, rX, rY, rZ, lX, lY, lZ, maturity = 'PG'] = regionInfo.split('|')
    // parse coordinates into numbers.
    // index 8 is maturity everything below is the coordinates
    .map((value, index) => index < 8
      ? parseInt(value)
      : value
    )

  let parsedMaturity
  switch (maturity.toUpperCase()) {
    case 'A':
      parsedMaturity = Maturity.Adult
      break

    case 'M':
      parsedMaturity = Maturity.Moderate
      break

    case 'PG':
    default:
      parsedMaturity = Maturity.General
      break
  }

  return notificationActionCreator({
    notificationType: NotificationTypes.TeleportLure,
    text: getStringValueOf(msg, 'MessageBlock', 'Message'),
    fromId: getValueOf(msg, 'AgentData', 'AgentID'),
    fromName: getStringValueOf(msg, 'MessageBlock', 'FromAgentName'),
    lureId: getValueOf(msg, 'MessageBlock', 'ID'),
    regionId: [gX, gY], // TODO: Change to BigInt ((x << 32) | y)
    position: [rX, rY, rZ],
    lockAt: [lX, lY, lZ],
    maturity: parsedMaturity,
    godLike: getValueOf(msg, 'MessageBlock', 'Dialog') === IMDialog.GodLikeTeleportLureOffered
  })
}

/**
 * Handles Inventory offers from Avatars and objects.
 * @param {object} msg IM Message from the server
 */
function handleInventoryOffer (msg) {
  const binaryBucket = getValueOf(msg, 'MessageBlock', 'BinaryBucket')
  const assetType = binaryBucket.readUInt8(0)

  return notificationActionCreator({
    notificationType: NotificationTypes.InventoryOffered,
    text: getStringValueOf(msg, 'MessageBlock', 'Message'),
    fromObject: getValueOf(msg, 'MessageBlock', 'Dialog') === IMDialog.TaskInventoryOffered,
    fromGroup: getValueOf(msg, 'MessageBlock', 'FromGroup'),
    fromId: getValueOf(msg, 'AgentData', 'AgentID'),
    fromName: getStringValueOf(msg, 'MessageBlock', 'FromAgentName'),
    item: {
      objectId: binaryBucket.length > 1
        ? new LLUUID(Array.from(binaryBucket.slice(1))).toString()
        : null,
      type: assetType,
      transactionId: getValueOf(msg, 'MessageBlock', 'ID')
    }
  })
}

/**
 * Warp an notification into an action.
 * @param {object} notification Body of an notification action.
 */
function notificationActionCreator (notification) {
  return {
    type: 'NOTIFICATION_RECEIVED',
    msg: notification
  }
}

/**
 * Handles messages that are notifications, but should be displayed in local chat.
 * @param {string} text Text of the Notification that should be displayed.
 * @param {string} [fromName=""] Displayed name of the sender.
 * @param {string|object} [fromId] Optional UUID of the sender.
 */
function handleNotificationInChat (text, fromName = '', fromId) {
  if (text == null) {
    throw new TypeError("handleNotificationInChat must receive a message! It didn't!")
  }

  return {
    type: 'NOTIFICATION_IN_CHAT_ADDED',
    text: text.toString(),
    fromName: fromName.toString(),
    fromId: typeof fromId === 'string'
      ? fromId
      : (fromId != null && fromId instanceof LLUUID ? fromId.toString() : null),
    time: Date.now()
  }
}

/**
 * Handles start and stop typing events in IM-chats
 * @param {object} msg IM Message from the server
 */
function handleIMTypingEvent (msg) {
  const dialog = getValueOf(msg, 'MessageBlock', 'Dialog')

  if (dialog !== IMDialog.StartTyping && dialog !== IMDialog.StopTyping) {
    throw new TypeError('handleIMTypingEvent did receive wrong Dialog: ' + dialog)
  }

  return {
    type: dialog === IMDialog.StartTyping
      ? 'IM_START_TYPING'
      : 'IM_STOP_TYPING',
    sessionId: getValueOf(msg, 'MessageBlock', 'ID'),
    agentId: getValueOf(msg, 'AgentData', 'AgentID')
  }
}

export function closeNotification (id) {
  return {
    type: 'NOTIFICATION_CLOSED',
    id
  }
}

export function saveIMChatMessages () {
  return async (dispatch, getState, { hoodie }) => {
    const unsavedChats = Object.values(getIMChats(getState())).filter(chat => chat.hasUnsavedMSG)

    const savingIds = {}
    const idToChatId = new Map()

    const chatsToSave = unsavedChats.flatMap(chat => {
      const ids = []
      savingIds[chat.sessionId] = ids

      return chat.messages.filter(msg => !msg.didSave).map(msg => {
        // side-effects!
        ids.push(msg._id)
        idToChatId.set(msg._id, chat.sessionId)

        return {
          ...msg,
          // add all fields that shouldn't be saved after this line
          didSave: undefined
        }
      })
    })

    if (chatsToSave.length === 0) return

    dispatch({
      type: 'INSTANT_MESSAGE_START_SAVING',
      chats: savingIds
    })

    const saved = await hoodie.cryptoStore.updateOrAdd(chatsToSave)

    const results = saved.reduce((all, msg, index) => {
      const sessionId = idToChatId.get(chatsToSave[index]._id) // use chatsToSave for errors

      let chat = all[sessionId]

      if (chat == null) {
        chat = {
          saved: [],
          didError: []
        }
        all[sessionId] = chat
      }

      if (msg instanceof Error) {
        chat.didError.push(chatsToSave[index]._id)
      } else {
        chat.saved.push(msg)
      }

      return all
    }, {})

    dispatch({
      type: 'INSTANT_MESSAGE_DID_SAVE',
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

/**
 * Start a new IM Chat from the UI.
 * @param {IMChatType} chatType Type of the new chat.
 * @param {string} targetId UUID of the chat target. This can be a avatar, conference or group.
 * @param {string} name Name of the chat.
 */
export function startNewIMChat (chatType, targetId, name) {
  return (dispatch, getState) => {
    const sessionId = calcSessionId(chatType, targetId, getAgentId(getState()))

    if (chatType === IMChatType.personal) {
      try {
        name = getAvatarNameById(getState(), targetId.toString()).getName()
      } catch (error) {
        console.error(error)
      }
    }

    dispatch(createNewIMChat(chatType, sessionId, targetId, name))
    dispatch(activateIMChat(sessionId))
    dispatch(changeTab(sessionId))

    return sessionId
  }
}

/**
 * Starts a new IMChat.
 * @param {IMChatType} chatType Type of the new chat
 * @param {string} sessionId ID of the chat
 * @param {string} target UUID of the chat target. This can be a avatar, conference or group.
 * @param {string} name Name of the chat.
 */
function createNewIMChat (chatType, sessionId, target, name) {
  return (dispatch, getState) => {
    const activeState = getState()

    // Stop if the chat already exists.
    if (sessionId in getIMChats(activeState)) return

    const saveId = uuid()

    dispatch({
      type: 'IM_CHAT_CREATED',
      _id: `${getAvatarDataSaveId(activeState)}/imChatsInfos/${saveId}`,
      chatType,
      sessionId,
      saveId,
      target,
      name
    })
  }
}

export function activateIMChat (sessionId) {
  return {
    type: 'IM_CHAT_ACTIVATED',
    sessionId
  }
}

export function saveIMChatInfos () {
  return async (dispatch, getState, { hoodie }) => {
    const chatInfosToSave = Object.values(getIMChats(getState()))
      .filter(chat => !chat.didSaveChatInfo)
      .map(chat => ({
        _id: chat._id,
        chatType: IMChatType[chat.type],
        sessionId: chat.sessionId,
        saveId: chat.saveId,
        target: chat.target,
        name: chat.name
      }))

    if (chatInfosToSave.length === 0) return

    dispatch({
      type: 'SAVING_IM_CHAT_INFO_STARTED',
      sessionIds: chatInfosToSave.map(chat => chat.sessionId)
    })

    const result = await hoodie.cryptoStore.findOrAdd(chatInfosToSave)

    const didError = []
    result.forEach((doc, index) => {
      if (doc instanceof Error) {
        didError.push(chatInfosToSave[index].sessionId)
      }
    })

    dispatch({
      type: 'SAVING_IM_CHAT_INFO_FINISHED',
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
        type: 'IM_CHAT_INFOS_LOADED',
        chats: result.map(parseIMChatInfo)
      })
    })

    // if the syncing didn't finish and new chat infos are loaded
    const handler = doc => {
      dispatch({
        type: 'IM_CHAT_INFOS_LOADED',
        chats: [parseIMChatInfo(doc)]
      })
    }
    store.on('add', handler)
    hoodie.one('avatarDidLogout', () => {
      store.off('add', handler)
    })
  }
}

function parseIMChatInfo (doc) {
  doc.chatType = IMChatType[doc.chatType]
  return doc
}

// Loads messages of an IM Chat.
export function getIMHistory (sessionId, chatSaveId) {
  return async (dispatch, getState, { hoodie }) => {
    dispatch({
      type: 'IM_HISTORY_LOADING_STARTED',
      sessionId
    })

    const activeState = getState()
    const chatSavePrefix = `${getAvatarDataSaveId(activeState)}/imChats/${chatSaveId}`

    const chat = getIMChats(activeState)[sessionId]
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
          type: 'IM_HISTORY_LOADING_FINISHED',
          sessionId,
          messages: [],
          didLoadAll: true
        })
        return
      }

      const messages = await hoodie.cryptoStore.find(ids)

      dispatch({
        type: 'IM_HISTORY_LOADING_FINISHED',
        sessionId,
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
          type: 'IM_HISTORY_LOADING_FINISHED',
          sessionId,
          messages,
          didLoadAll: messages.length === 0
        })
      } else {
        dispatch({
          type: 'IM_HISTORY_LOADING_FINISHED',
          sessionId,
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

// Create a new sessionId from type, target-UUID & agentUUID
function calcSessionId (type, targetId, agentId) {
  switch (type) {
    case IMChatType.personal:
      return uuidXOR(agentId, targetId)

    case IMChatType.group:
    case IMChatType.conference:
      return targetId

    default:
      throw new Error(`Chat type '${type}' not jet supported!`)
  }
}
