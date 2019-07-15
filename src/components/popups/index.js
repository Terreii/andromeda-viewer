import React from 'react'
import { Portal } from 'react-portal'
import { useSelector, useDispatch } from 'react-redux'

import Popup from './popup'
import SignInPopup from './signInPopup'
import SignOutPopup from './signOutPopup'
import UnlockDialog from './unlockDialog'
import ResetKeysPopup from './resetKeysPopup'
import ResetPasswordDialog from './resetPasswordDialog'

import {
  closePopup,
  signUp,
  signIn,
  signOut,
  unlock,
  showResetPassword,
  changeEncryptionPassword
} from '../../actions/viewerAccount'

import { selectPopup, selectPopupData } from '../../selectors/popup'

export default (props) => {
  const popup = useSelector(selectPopup)
  const data = useSelector(selectPopupData)

  const dispatch = useDispatch()

  const doClosePopup = () => dispatch(closePopup())
  const doSignUp = (username, password, cryptoPassword) => dispatch(
    signUp(username, password, cryptoPassword)
  )
  const doSignIn = (username, password, cryptoPassword) => dispatch(
    // For viewer-account (to sync)
    signIn(username, password, cryptoPassword)
  )
  const doSignOut = () => dispatch(signOut())
  const doUnlock = cryptoPassword => dispatch(unlock(cryptoPassword))
  const displayResetPassword = type => dispatch(showResetPassword(type))
  const doChangeEncryptionPassword = (resetKey, nextPassword) => dispatch(
    changeEncryptionPassword(resetKey, nextPassword)
  )

  if (popup == null || popup.length === 0) return null

  switch (popup) {
    case 'unlock':
      return <Portal>
        <UnlockDialog
          onUnlock={doUnlock}
          onForgottenPassword={displayResetPassword}
          onSignOut={doSignOut}
        />
      </Portal>

    case 'signIn':
      return <Portal>
        <SignInPopup onCancel={doClosePopup} onSend={doSignIn} />
      </Portal>

    case 'signUp':
      return <Portal>
        <SignInPopup onCancel={doClosePopup} isSignUp onSend={doSignUp} />
      </Portal>

    case 'resetKeys':
      return <Portal>
        <ResetKeysPopup onClose={doClosePopup} resetKeys={data} />
      </Portal>

    case 'signOut':
      return <Portal>
        <SignOutPopup onCancel={doClosePopup} onSignOut={doSignOut} />
      </Portal>

    case 'resetPassword':
      return <Portal>
        <ResetPasswordDialog
          onChangePassword={doChangeEncryptionPassword}
          onCancel={doClosePopup}
          onSignOut={doSignOut}
          type={data}
        />
      </Portal>

    default:
      return <Portal>
        <Popup title={'Error'} onClose={doClosePopup}>
          {popup}
        </Popup>
      </Portal>
  }
}
