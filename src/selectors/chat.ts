// Selectors for chat (local chat and IMs)

import { createSelector } from 'reselect'

import { selectIsSignedIn, selectShouldSync } from '../reducers/account'

export const getActiveTab = (state: any): string => state.session.activeChatTab

// checks if the chat history should be saved and synced
export const getShouldSaveChat = createSelector(
  [
    selectShouldSync,
    selectIsSignedIn
  ],
  (sync, isSignedIn) => sync && isSignedIn
)
