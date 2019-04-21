// Selectors for chat (local chat and IMs)

import { createSelector } from 'reselect'

import { getIsSignedIn, getShouldSync } from './viewer'

export const getActiveTab = state => state.session.get('activeChatTab')

export const getLocalChat = state => state.localChat

export const getIMChats = state => state.IMs

export const getActiveIMChats = createSelector(
  [
    getIMChats
  ],
  chats => chats.filter(chat => chat.get('active'))
)

// checks if the chat history should be saved and synced
export const getShouldSaveChat = createSelector(
  [
    getShouldSync,
    getIsSignedIn
  ],
  (sync, isSignedIn) => sync && isSignedIn
)

export const getNotifications = state => state.session.get('notifications')

export const getShouldDisplayNotifications = createSelector(
  [
    getNotifications,
    getActiveTab
  ],
  (notifications, activeTab) => !notifications.isEmpty() || activeTab === 'notifications'
)
