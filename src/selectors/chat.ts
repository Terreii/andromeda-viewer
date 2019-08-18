// Selectors for chat (local chat and IMs)

import { createSelector } from 'reselect'

import { getIsSignedIn, getShouldSync } from './viewer'

import { LocalChatMessage, IMChat, Notification } from '../types/chat'

export const getActiveTab = (state: any): string => state.session.activeChatTab

export const getLocalChat = (state: any): LocalChatMessage[] => state.localChat

export const getIMChats = (state: any): { [key: string]: IMChat } => state.IMs

export const getActiveIMChats = createSelector(
  [
    getIMChats
  ],
  chats => Object.values(chats).filter(chat => chat.active)
)

// checks if the chat history should be saved and synced
export const getShouldSaveChat = createSelector(
  [
    getShouldSync,
    getIsSignedIn
  ],
  (sync, isSignedIn) => sync && isSignedIn
)

export const getNotifications = (state: any): Notification[] => state.session.notifications

export const getShouldDisplayNotifications = createSelector(
  [
    getNotifications,
    getActiveTab
  ],
  (notifications, activeTab) => notifications.length > 0 || activeTab === 'notifications'
)
