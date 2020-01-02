import { createSelector } from 'reselect'

import { selectIsSignedIn, selectIsUnlocked } from '../reducers/account'
import { selectErrorMessage } from '../reducers/session'

type SignInPopup = 'signUp' | 'signIn' | 'signOut' | 'resetPassword' | 'resetKeys' | null

export type PopupType = SignInPopup | 'unlock'

export const selectPopup = createSelector(
  [
    selectIsSignedIn,
    selectIsUnlocked,
    (state: any): SignInPopup => state.account.signInPopup,
    selectErrorMessage
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
