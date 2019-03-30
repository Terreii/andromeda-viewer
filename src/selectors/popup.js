import { createSelector } from 'reselect'

import { getErrorMessage } from './session'

export const selectPopup = createSelector(
  [
    state => state.account,
    getErrorMessage
  ],
  (account, sessionError) => {
    const isUnlocked = account.get('unlocked')
    const isSignedIn = account.getIn(['viewerAccount', 'loggedIn'])
    const popup = account.getIn(['viewerAccount', 'signInPopup']) || sessionError

    if (popup === 'resetPassword') return popup

    return !isUnlocked && isSignedIn
      ? 'unlock'
      : popup
  }
)

export const selectPopupData = state => state.account.getIn(['viewerAccount', 'popupData'])
