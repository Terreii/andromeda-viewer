// Selectors for chat (local chat and IMs)

import { createSelector } from 'reselect'

import { getIsSignedIn, getShouldSync } from './viewer'

export const getActiveTab = (state: any): string => state.session.activeChatTab

// checks if the chat history should be saved and synced
export const getShouldSaveChat = createSelector(
  [
    getShouldSync,
    getIsSignedIn
  ],
  (sync, isSignedIn) => sync && isSignedIn
)
