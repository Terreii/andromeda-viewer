/*
 * Reduces all IM-Chats and IM-Messages
 */

import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit'

import { chatSessionStarted } from './groups'
import { logout, userWasKicked } from './session'

import { RootState } from '../store/configureStore'
import { IMChatType, IMChat, InstantMessage } from '../types/chat'

const imSlice = createSlice({
  name: 'im',

  initialState: ((): {
    chats: { [key: string]: IMChat },
    messages: { [key: string]: InstantMessage[] }
  } => ({
    chats: {},
    messages: {}
  }))(),

  reducers: {
    create (state, action: PayloadAction<NewChatActionPayload>) {
      const sessionId = action.payload.sessionId
      if (sessionId in state.chats) return

      const chat = getDefaultImChat()
      chat._id = action.payload._id
      chat.didSaveChatInfo = false
      chat.sessionId = sessionId
      chat.saveId = action.payload.saveId
      chat.type = action.payload.chatType
      chat.target = action.payload.target
      chat.name = action.payload.name
      state.chats[sessionId] = chat
      state.messages[sessionId] = []
    },

    infosLoaded (state, action: PayloadAction<NewChatActionPayload[]>) {
      for (const chat of action.payload) {
        if (!(chat.sessionId in state.chats)) {
          state.chats[chat.sessionId] = getDefaultImChat()
          state.messages[chat.sessionId] = []
        }
        const chatData = state.chats[chat.sessionId]

        if (chatData._id === '') {
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

    activateChat: {
      reducer (state, action: PayloadAction<string>) {
        state.chats[action.payload].active = true
      },

      prepare (sessionId: string) {
        return {
          payload: sessionId
        }
      }
    },

    startSavingInfo (state, action: PayloadAction<string[]>) {
      for (const id of action.payload) {
        state.chats[id].didSaveChatInfo = true
      }
    },

    finishedSavingInfo (state, action: PayloadAction<{ didError: string[] }>) {
      for (const id of action.payload.didError) {
        state.chats[id].didSaveChatInfo = false
      }
    },

    received (
      state,
      action: PayloadAction<{ chatType: IMChatType, session: string, msg: InstantMessage }>
    ) {
      const sessionId = action.payload.session
      if (!(sessionId in state.chats)) return

      state.messages[sessionId].push({
        ...action.payload.msg,
        didSave: false
      })
      const chat = state.chats[sessionId]
      chat.active = true
      chat.hasUnsavedMSG = true
    },

    startedTyping (state, action: PayloadAction<{ sessionId: string, agentId: string }>) {
      const chat = state.chats[action.payload.sessionId]

      if (!chat.areTyping.includes(action.payload.agentId)) {
        chat.areTyping.push(action.payload.agentId)
      }
    },

    stoppedTyping (state, action: PayloadAction<{ sessionId: string, agentId: string }>) {
      const chat = state.chats[action.payload.sessionId]

      chat.areTyping = chat.areTyping.filter(agentId => agentId !== action.payload.agentId)
    },

    savingMessagesStarted (state, action: PayloadAction<{ [key: string]: string[] }>) {
      for (const [id, savingIds] of Object.entries(action.payload)) {
        const chat = state.chats[id]
        let stillHasUnsaved = false

        for (const msg of state.messages[id]) {
          if (!msg.didSave && !savingIds.includes(msg._id)) {
            stillHasUnsaved = true
          } else {
            msg.didSave = true
          }
        }

        chat.hasUnsavedMSG = stillHasUnsaved
      }
    },

    savingMessagesFinished (
      state,
      action: PayloadAction<{ [key: string]: { saved: InstantMessage[], didError: string[] } }>
    ) {
      for (const [id, data] of Object.entries(action.payload)) {
        const chat = state.chats[id]
        let stillHasUnsavedMsg = false

        const didSave = new Map()
        for (const msg of data.saved) {
          didSave.set(msg._id, msg)
        }

        const didError = new Set(data.didError)

        for (const msg of state.messages[id]) {
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

    historyLoadingStarted (state, action: PayloadAction<{ sessionId: string }>) {
      state.chats[action.payload.sessionId].isLoadingHistory = true
    },

    historyLoadingFinished (
      state,
      action: PayloadAction<{ sessionId: string, messages: InstantMessage[], didLoadAll: boolean }>
    ) {
      const chat = state.chats[action.payload.sessionId]

      const historyMsg = action.payload.messages.map(msg => ({
        ...msg,
        didSave: true
      }))

      state.messages[action.payload.sessionId].splice(0, 0, ...historyMsg)
      chat.isLoadingHistory = false
      chat.didLoadHistory = action.payload.didLoadAll
    }
  },

  extraReducers: {
    [chatSessionStarted.type]: (state, action: PayloadAction<{
      avatarDataSaveId: string,
      groups: { [key: string]: { id: string, saveId: string, name: string } }
    }>) => {
      for (const [groupId, data] of Object.entries(action.payload.groups)) {
        if (!(groupId in state.chats)) {
          state.chats[groupId] = getDefaultImChat()
          state.messages[groupId] = []
        }
        const chatData = state.chats[groupId]

        if (chatData._id === '') {
          chatData._id = `${action.payload.avatarDataSaveId}/imChatsInfos/${data.saveId}`
          chatData.sessionId = data.id
          chatData.saveId = data.saveId
        }

        chatData.type = IMChatType.group
        chatData.target = data.id
        chatData.name = data.name
      }
    },

    [logout.type] (state) {
      state.chats = {}
      state.messages = {}
    },

    [userWasKicked.type] (state) {
      state.chats = {}
      state.messages = {}
    }
  }
})

export default imSlice.reducer

export const {
  create,
  infosLoaded,
  activateChat,
  startSavingInfo,
  finishedSavingInfo,
  received,
  startedTyping,
  stoppedTyping,
  savingMessagesStarted,
  savingMessagesFinished,
  historyLoadingStarted,
  historyLoadingFinished
} = imSlice.actions

// Selectors

export const selectIMChats = (state: RootState): { [key: string]: IMChat } => state.IMs.chats

export const selectActiveIMChats = createSelector(
  [
    selectIMChats
  ],
  chats => Object.values(chats).filter(chat => chat.active)
)

export const selectChatMessages = (state: RootState, id: string): InstantMessage[] | undefined => {
  return state.IMs.messages[id]
}

// Helpers

function getDefaultImChat (): IMChat {
  return {
    _id: '',
    sessionId: '',
    saveId: '',
    type: IMChatType.personal,
    target: '',
    name: '',

    didSaveChatInfo: false,
    didLoadHistory: false,
    isLoadingHistory: false,
    active: false,
    hasUnsavedMSG: false,
    areTyping: []
  }
}

export interface NewChatActionPayload {
  _id: string,
  sessionId: string,
  saveId: string,
  chatType: IMChatType,
  target: string,
  name: string
}
