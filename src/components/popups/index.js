import React from 'react'
import { Portal } from 'react-portal'

import Popup from './popup'
import SignInPopup from './signInPopup'
import SignOutPopup from './signOutPopup'
import UnlockDialog from './unlockDialog'

export default function PopupRenderer ({ popup, closePopup, signIn, signUp, unlock, signOut }) {
  if (popup == null || popup.length === 0) return null

  switch (popup) {
    case 'unlock':
      return <Portal>
        <UnlockDialog onUnlock={unlock} onSignOut={signOut} />
      </Portal>

    case 'signIn':
      return <Portal>
        <SignInPopup onCancel={closePopup} onSend={signIn} />
      </Portal>

    case 'signUp':
      return <Portal>
        <SignInPopup onCancel={closePopup} isSignUp onSend={signUp} />
      </Portal>

    case 'signOut':
      return <Portal>
        <SignOutPopup onCancel={closePopup} onSignOut={signOut} />
      </Portal>

    default:
      return <Portal>
        <Popup title={'Error'} onClose={closePopup}>
          {popup}
        </Popup>
      </Portal>
  }
}
