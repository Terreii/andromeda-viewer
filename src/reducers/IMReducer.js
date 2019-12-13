/*
 * Reduces all IM-Chats and IM-Messages
 */

import { createReducer } from '@reduxjs/toolkit'

import { chatSessionStarted } from './groups'

import { IMChatType } from '../types/chat'

function getDefaultImChat () {
  return {
    _id: null,
    sessionId: null,
    saveId: null,
    type: IMChatType.personal,
    target: null,
    name: null,

    didSaveChatInfo: false,
    didLoadHistory: false,
    isLoadingHistory: false,
    active: false,
    hasUnsavedMSG: false,
    areTyping: [],
    messages: []
  }
}

export default createReducer({}, {
  IM_CHAT_CREATED (state, action) {
    if (action.sessionId in state) return

    const chat = getDefaultImChat()
    chat._id = action._id
    chat.didSaveChatInfo = false
    chat.sessionId = action.sessionId
    chat.saveId = action.saveId
    chat.type = action.chatType
    chat.target = action.target
    chat.name = action.name
    state[action.sessionId] = chat
  },

  IM_CHAT_INFOS_LOADED (state, action) {
    for (const chat of action.chats) {
      if (!(chat.sessionId in state)) {
        state[chat.sessionId] = getDefaultImChat()
      }
      const chatData = state[chat.sessionId]

      if (chatData._id == null) {
        chatData._id = chat._id
      }

      chatData.didSaveChatInfo = true
      chatData.sessionId = chat.sessionId
      chatData.saveId = chat.saveId
      chatData.type = chat.chatType
      chatData.target = chat.target
      chatData.name = chat.name
    }
  },

  [chatSessionStarted.type]: (state, action) => {
    for (const [groupId, data] of Object.entries(action.payload)) {
      if (!(groupId in state)) {
        state[groupId] = getDefaultImChat()
      }
      const chatData = state[groupId]

      if (chatData._id == null) {
        chatData._id = `${action.meta.avatarDataSaveId}/imChatsInfos/${data.saveId}`
        chatData.sessionId = data.id
        chatData.saveId = data.saveId
      }

      chatData.type = IMChatType.group
      chatData.target = data.id
      chatData.name = data.name
    }
  },

  IM_CHAT_ACTIVATED (state, action) {
    state[action.sessionId].active = true
  },

  SAVING_IM_CHAT_INFO_STARTED (state, action) {
    for (const id of action.sessionIds) {
      state[id].didSaveChatInfo = true
    }
  },

  SAVING_IM_CHAT_INFO_FINISHED (state, action) {
    for (const id of action.didError) {
      state[id].didSaveChatInfo = false
    }
  },

  PERSONAL_IM_RECEIVED (state, action) {
    if (!(action.sessionId in state)) return

    const chat = state[action.sessionId]
    chat.messages.push({
      ...action.msg,
      didSave: false
    })
    chat.active = true
    chat.hasUnsavedMSG = true
  },

  GROUP_IM_RECEIVED (state, action) {
    if (!(action.groupId in state)) return

    const chat = state[action.groupId]
    chat.messages.push({
      ...action.msg,
      didSave: false
    })
    chat.active = true
    chat.hasUnsavedMSG = true
  },

  CONFERENCE_IM_RECEIVED (state, action) {
    if (!(action.conferenceId in state)) return

    const chat = state[action.conferenceId]
    chat.messages.push({
      ...action.msg,
      didSave: false
    })
    chat.active = true
    chat.hasUnsavedMSG = true
  },

  BUSY_AUTO_RESPONSE_RECEIVED (state, action) {
    if (!(action.sessionId in state)) return

    const chat = state[action.sessionId]
    chat.messages.push({
      ...action.msg,
      didSave: false
    })
    chat.active = true
    chat.hasUnsavedMSG = true
  },

  SYSTEM_IM_RECEIVED (state, action) {
    if (!(action.sessionId in state)) return

    const chat = state[action.sessionId]
    chat.messages.push({
      ...action.msg,
      didSave: false
    })
    chat.active = true
    chat.hasUnsavedMSG = true
  },

  IM_START_TYPING (state, action) {
    const chat = state[action.sessionId]

    if (!chat.areTyping.includes(action.agentId)) {
      chat.areTyping.push(action.agentId)
    }
  },

  IM_STOP_TYPING (state, action) {
    const chat = state[action.sessionId]

    chat.areTyping = chat.areTyping.filter(agentId => agentId !== action.agentId)
  },

  INSTANT_MESSAGE_START_SAVING (state, action) {
    for (const [id, savingIds] of Object.entries(action.chats)) {
      const chat = state[id]
      let stillHasUnsaved = false

      for (const msg of chat.messages) {
        if (!msg.didSave && !savingIds.includes(msg._id)) {
          stillHasUnsaved = true
        } else {
          msg.didSave = true
        }
      }

      chat.hasUnsavedMSG = stillHasUnsaved
    }
  },

  INSTANT_MESSAGE_DID_SAVE (state, action) {
    for (const [id, data] of Object.entries(action.chats)) {
      const chat = state[id]
      let stillHasUnsavedMsg = false

      const didSave = new Map()
      for (const msg of data.saved) {
        didSave.set(msg._id, msg)
      }

      const didError = new Set(data.didError)

      for (const msg of chat.messages) {
        if (didError.has(msg._id)) {
          stillHasUnsavedMsg = true
          msg.didSave = false
        } else if (didSave.has(msg._id)) {
          // write all data to msg object
          Object.assign(msg, didSave.get(msg._id))
        } else if (!msg.didSave) {
          stillHasUnsavedMsg = true
        }
      }

      chat.hasUnsavedMSG = stillHasUnsavedMsg
    }
  },

  IM_HISTORY_LOADING_STARTED (state, action) {
    state[action.sessionId].isLoadingHistory = true
  },

  IM_HISTORY_LOADING_FINISHED (state, action) {
    const chat = state[action.sessionId]

    const historyMsg = action.messages.map(msg => ({
      ...msg,
      didSave: true
    }))

    chat.messages.splice(0, 0, ...historyMsg)
    chat.isLoadingHistory = false
    chat.didLoadHistory = action.didLoadAll
  },

  DidLogout () {
    return {}
  },

  UserWasKicked () {
    return {}
  }
})
