'use strict'

/*
 * Sends a message to the server.
 */

import State from '../stores/state'
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

export function getLocalChatHistory (avatarName) {
  return (dispatch, getState, hoodie) => {
    return hoodie.store.withIdPrefix(`${avatarName}/localchat/`).findAll()
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
    const avatarName = activeState.account.get('avatarName')
    const doc = {
      _id: `${avatarName}/imChatsInfos/${chatUUID}`,
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

    const avatarName = activeState.account.get('avatarName')
    hoodie.store.withIdPrefix(`${avatarName}/imChatsInfos/`).findAll().then(result => {
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
    const avatarName = getState().account.get('avatarName')
    hoodie.store.withIdPrefix(`${avatarName}/imChats/${chatUUID}`).findAll().catch(err => {
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
