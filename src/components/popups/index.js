import React from 'react'
import { Portal } from 'react-portal'

import Popup from './popup'
import SignInPopup from './signInPopup'
import SignOutPopup from './signOutPopup'
import UnlockDialog from './unlockDialog'
import ResetKeysPopup from './resetKeysPopup'
import ResetPasswordDialog from './resetPasswordDialog'

export default ({
  popup,
  data,
  closePopup,
  displayResetPassword,
  signIn,
  signUp,
  unlock,
  signOut,
  changePassword
}) => {
  if (popup == null || popup.length === 0) return null

  switch (popup) {
    case 'unlock':
      return <Portal>
        <UnlockDialog
          onUnlock={unlock}
          onForgottenPassword={displayResetPassword}
          onSignOut={signOut}
        />
      </Portal>

    case 'signIn':
      return <Portal>
        <SignInPopup onCancel={closePopup} onSend={signIn} />
      </Portal>

    case 'signUp':
      return <Portal>
        <SignInPopup onCancel={closePopup} isSignUp onSend={signUp} />
      </Portal>

    case 'resetKeys':
      return <Portal>
        <ResetKeysPopup onClose={closePopup} resetKeys={data} />
      </Portal>

    case 'signOut':
      return <Portal>
        <SignOutPopup onCancel={closePopup} onSignOut={signOut} />
      </Portal>

    case 'resetPassword':
      return <Portal>
        <ResetPasswordDialog
          onChangePassword={changePassword}
          onCancel={closePopup}
          onSignOut={signOut}
          type={data}
        />
      </Portal>

    default:
      return <Portal>
        <Popup title={'Error'} onClose={closePopup}>
          {popup}
        </Popup>
      </Portal>
  }
}
