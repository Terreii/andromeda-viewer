import { createSelector } from 'reselect'

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
    state => state.account
  ],
  account => account.get('sync') && account.getIn(['viewerAccount', 'loggedIn'])
)
