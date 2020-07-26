/*
 * Stores all LocalChat-Messages
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { UUID as LLUUID } from '../llsd'
import { login, logout, userWasKicked, LoginAction } from './session'

import {
  LocalChatMessage,
  LocalChatAudible,
  LocalChatSourceType,
  LocalChatType,
  NotificationInChat
} from '../types/chat'

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const chatSlice = createSlice({
  name: 'localChat',

  initialState: ((): LocalChatMessage[] => [])(),

  reducers: {
    received (state, action: PayloadAction<LocalChatMessage>) {
      if (
        action.payload.chatType === LocalChatType.StartTyping ||
        action.payload.chatType === LocalChatType.StopTyping
      ) {
        return
      }

      state.push({
        ...action.payload,
        didSave: false
      })
    },

    notificationInChatAdded: {
      reducer (state, action: PayloadAction<NotificationInChat>) {
        state.push({
          _id: 'notification_' + state.length,
          fromName: action.payload.fromName,
          fromId: action.payload.fromId || 'object',
          sourceType: LocalChatSourceType.Object,
          chatType: LocalChatType.OwnerSay,
          audible: LocalChatAudible.Fully,
          position: [0, 0, 0],
          message: action.payload.text,
          time: action.payload.time,
          didSave: false
        })
      },

      /**
       * Handles messages that are notifications, but should be displayed in local chat.
       * @param {string} text - Text of the Notification that should be displayed.
       * @param {string} [fromName=""] - Displayed name of the sender.
       * @param {string|object} [fromId] - Optional UUID of the sender.
       */
      prepare (text: string, fromName = '', fromId: string | any) {
        return {
          payload: {
            text: text.toString(),
            fromName: fromName.toString(),
            fromId: typeof fromId === 'string'
              ? fromId
              : (fromId != null && fromId instanceof LLUUID ? fromId.toString() : null),
            time: Date.now()
          }
        }
      }
    },

    savingStarted (state, action: PayloadAction<string[]>) {
      if (action.payload.length === 0) return

      for (const msg of state) {
        if (action.payload.includes(msg._id)) {
          msg.didSave = true
        }
      }
    },

    savingFinished (
      state,
      action: PayloadAction<{ saved: LocalChatMessage[], didError: string[] }>
    ) {
      if (action.payload.didError.length === 0 && action.payload.saved.length === 0) return

      const ids = action.payload.saved.map(msg => msg._id)

      for (const msg of state) {
        const index = ids.indexOf(msg._id)
        if (index >= 0) {
          // write all data to msg object
          Object.assign(msg, action.payload.saved[index])
        } else if (action.payload.didError.includes(msg._id)) {
          msg.didSave = false
        }
      }
    }
  },

  extraReducers: {
    [login.type] (state, action: PayloadAction<LoginAction>) {
      state.push(...action.payload.localChatHistory.map((msg: any) => {
        const typeString: any = capitalize(msg.chatType)
        const sourceTypeString: any = capitalize(msg.sourceType)
        const audible: any = capitalize(msg.audible)
        return {
          ...msg,
          chatType: LocalChatType[typeString],
          sourceType: LocalChatSourceType[sourceTypeString],
          audible: LocalChatAudible[audible],
          didSave: true
        }
      }))

      state.push({
        _id: 'messageOfTheDay',
        fromName: 'Message of the Day',
        fromId: 'messageOfTheDay',
        sourceType: LocalChatSourceType.System,
        chatType: LocalChatType.OwnerSay,
        audible: LocalChatAudible.Fully,
        position: [0, 0, 0],
        message: action.payload.sessionInfo.message,
        time: action.payload.sessionInfo.seconds_since_epoch * 1000,
        didSave: true
      })
    },

    [logout.type] () {
      return []
    },

    [userWasKicked.type] () {
      return []
    }
  }
})

export default chatSlice.reducer

export const {
  received,
  notificationInChatAdded,
  savingStarted,
  savingFinished
} = chatSlice.actions

export const selectLocalChat = (state: any): LocalChatMessage[] => state.localChat
