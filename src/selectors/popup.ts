import { createSelector } from 'reselect'

import { getIsSignedIn, getIsUnlocked } from './viewer'
import { getErrorMessage } from './session'

type SignInPopup = 'signUp' | 'signIn' | 'signOut' | 'resetPassword' | 'resetKeys' | null

export type PopupType = SignInPopup | 'unlock'

export const selectPopup = createSelector(
  [
    getIsSignedIn,
    getIsUnlocked,
    (state: any): SignInPopup => state.account.signInPopup,
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

export const selectPopupData = (state: any): any | null => state.account.popupData
