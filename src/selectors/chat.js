import { createSelector } from 'reselect'

export const getLocalChat = state => state.localChat

export const getIMChats = state => state.IMs

export const getShouldSaveChat = createSelector(
  [
    state => state.account
  ],
  account => account.get('sync') && account.getIn(['viewerAccount', 'loggedIn'])
)
