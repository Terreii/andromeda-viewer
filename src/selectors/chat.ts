// Selectors for chat (local chat and IMs)

import { createSelector } from 'reselect'

import { getIsSignedIn, getShouldSync } from './viewer'

import { IMChat } from '../types/chat'

export const getActiveTab = (state: any): string => state.session.activeChatTab

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
