import { createSelector } from 'reselect'

import { getIsSignedIn, getIsUnlocked } from './viewer'
import { getErrorMessage } from './session'

export const selectPopup = createSelector(
  [
    getIsSignedIn,
    getIsUnlocked,
    state => state.account.get('signInPopup'),
    getErrorMessage
  ],
  (isSignedIn, isUnlocked, signInPopup, sessionError) => {
    const popup = signInPopup || sessionError

    if (popup === 'resetPassword') return popup

    return !isUnlocked && isSignedIn
      ? 'unlock'
      : popup
  }
)

export const selectPopupData = state => state.account.get('popupData')
