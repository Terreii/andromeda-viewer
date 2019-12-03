/*
 * Stores all LocalChat-Messages
 */

import { createReducer } from '@reduxjs/toolkit'

import { LocalChatAudible, LocalChatSourceType, LocalChatType } from '../types/chat'

const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

export default createReducer([], {
  CHAT_FROM_SIMULATOR_RECEIVED (state, action) {
    // filter out start typing and end typing
    if (action.msg.chatType === LocalChatType.StartTyping ||
      action.msg.chatType === LocalChatType.StopTyping
    ) {
      return
    }

    state.push({
      ...action.msg,
      didSave: false
    })
  },

  didLogin (state, action) {
    state.push(...action.localChatHistory.map(msg => ({
      ...msg,
      chatType: LocalChatType[capitalize(msg.chatType)],
      sourceType: LocalChatSourceType[capitalize(msg.sourceType)],
      audible: LocalChatAudible[capitalize(msg.audible)],
      didSave: true
    })))

    state.push({
      _id: 'messageOfTheDay',
      fromName: 'Message of the Day',
      fromId: 'messageOfTheDay',
      sourceType: LocalChatSourceType.System,
      chatType: LocalChatType.OwnerSay,
      audible: LocalChatAudible.Fully,
      position: [0, 0, 0],
      message: action.sessionInfo.message,
      time: action.sessionInfo.seconds_since_epoch * 1000,
      didSave: true
    })
  },

  NOTIFICATION_IN_CHAT_ADDED (state, action) {
    state.push({
      _id: 'notification_' + state.length,
      fromName: action.fromName,
      fromId: action.fromId || 'object',
      sourceType: LocalChatSourceType.Object,
      chatType: LocalChatType.OwnerSay,
      audible: LocalChatAudible.Fully,
      position: [0, 0, 0],
      message: action.text,
      time: action.time,
      didSave: false
    })
  },

  SAVING_LOCAL_CHAT_MESSAGES_START (state, action) {
    if (action.saving.length === 0) return

    for (const msg of state) {
      if (action.saving.includes(msg._id)) {
        msg.didSave = true
      }
    }
  },

  DID_SAVE_LOCAL_CHAT_MESSAGE (state, action) {
    if (action.didError.length === 0 && action.saved.length === 0) return

    const ids = action.saved.map(msg => msg._id)

    for (const msg of state) {
      const index = ids.indexOf(msg._id)
      if (index >= 0) {
        // write all data to msg object
        Object.assign(msg, action.saved[index])
      } else if (action.didError.includes(msg._id)) {
        msg.didSave = false
      }
    }
  },

  DidLogout () {
    return []
  },

  UserWasKicked () {
    return []
  }
})
