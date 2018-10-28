import React from 'react'

import Popup from './popup'
import SignInPopup from './signInPopup'
import SignOutPopup from './signOutPopup'
import UnlockDialog from './unlockDialog'

export default function PopupRenderer ({ popup, closePopup, signIn, signUp, unlock, signOut }) {
  if (popup == null || popup.length === 0) return null

  switch (popup) {
    case 'unlock':
      return <UnlockDialog onUnlock={unlock} onSignOut={signOut} />

    case 'signIn':
      return <SignInPopup onCancel={closePopup} onSend={signIn} />

    case 'signUp':
      return <SignInPopup onCancel={closePopup} isSignUp onSend={signUp} />

    case 'signOut':
      return <SignOutPopup onCancel={closePopup} onSignOut={signOut} />

    default:
      return <Popup title={'Error'} onClose={closePopup}>
        {popup}
      </Popup>
  }
}
