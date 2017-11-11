/*
 * Sends a message to the server.
 */

import State from '../store/state'
import {
  getAgentId,
  getActiveCircuit,
  getSessionId,
  getParentEstateID,
  getRegionID,
  getPosition,
  getAvatarName
} from '../session'

export function sendLocalChatMessage (text, type, channel) {
  // Sends messages from the localchat
  // No UI update, because the server/sim will send it
  getActiveCircuit().send('ChatFromViewer', {
    AgentData: [
      {
        AgentID: getAgentId(),
        SessionID: getSessionId()
      }
    ],
    ChatData: [
      {
        Message: text,
        Type: type,
        Channel: channel
      }
    ]
  })
}

export function sendInstantMessage (text, to, id) {
  try {
    const agentID = getAgentId()
    const sessionID = getSessionId()
    const parentEstateID = getParentEstateID()
    const regionID = getRegionID()
    const position = getPosition()
    const fromAgentName = getAvatarName().getFullName()
    const binaryBucket = Buffer.from([])
    const time = new Date()
    getActiveCircuit().send('ImprovedInstantMessage', {
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
    })
    State.dispatch((dispatch, getState, hoodie) => {
      const activeState = getState()
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
      if (activeState.account.getIn(['viewerAccount', 'loggedIn'])) {
        hoodie.store.add(msg).then(doc => {
          dispatch(actionData)
        })
      } else {
        dispatch(actionData)
      }
    })
  } catch (e) {
    console.error(e)
  }
}

export function getLocalChatHistory (avatarIdentifier) {
  return (dispatch, getState, hoodie) => {
    return hoodie.store.withIdPrefix(`${avatarIdentifier}/localchat/`).findAll()
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

// UUID make structure: 00000000-0000-4000-x000-000000000000
// all are hexadecimal numbers.
// 4 is always 4 and x is between 8 and b.
function uuidXOR (idIn1, idIn2) {
  const id1 = idIn1.toString().replace(/-/gi, '')
  const id2 = idIn2.toString().replace(/-/gi, '')

  let out = ''
  for (let i = 0; i < 16; ++i) {
    const index = i * 2
    const byte1 = parseInt(id1[index] + id1[index + 1], 16)
    const byte2 = parseInt(id2[index] + id2[index + 1], 16)

    let xorByte = byte1 ^ byte2
    if (i === 6) { // Makes the 4 in the UUID
      xorByte = (0b00001111 & xorByte) | (4 << 4)
    } else if (i === 8) { // Makes the y in the UUID. It is between 8 and b
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

// Start a new IM Chat from the UI.
export function startNewIMChat (dialog, targetId, name) {
  return (dispatch, getState, hoodie) => {
    try {
      const chatType = getIMChatTypeOfDialog(dialog)
      const chatUUID = calcChatUUID(chatType, targetId, getState().account.get('agentId'))
      if (chatType === 'personal') {
        try {
          name = getState().names.getIn(['names', targetId.toString()]).getName()
        } catch (error) {
          console.error(error)
        }
      }

      dispatch(createNewIMChat(dialog, chatUUID, targetId, name))

      return Promise.resolve(chatUUID)
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

// Starts a new IMChat. It also saves it into Hoodie.
export function createNewIMChat (dialog, chatUUID, target, name) {
  const type = getIMChatTypeOfDialog(dialog)
  if (type == null) return () => {}
  return (dispatch, getState, hoodie) => {
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
    if (hasChat || !activeState.account.getIn(['viewerAccount', 'loggedIn'])) return
    const avatarIdentifier = activeState.account.get('avatarIdentifier')
    const doc = {
      _id: `${avatarIdentifier}/imChatsInfos/${chatUUID}`,
      chatType: type,
      chatUUID,
      target,
      name
    }
    hoodie.store.updateOrAdd(doc)
  }
}

// Loads IM Chat Infos.
export function loadIMChats () {
  return (dispatch, getState, hoodie) => {
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
  return (dispatch, getState, hoodie) => {
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
