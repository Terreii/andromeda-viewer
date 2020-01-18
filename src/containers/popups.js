import React from 'react'
import { Portal } from 'react-portal'
import { useSelector, useDispatch } from 'react-redux'

import Popup from '../components/popups/popup'
import SignOutPopup from '../components/popups/signOutPopup'
import UnlockDialog from '../components/popups/unlockDialog'
import ResetKeysPopup from '../components/popups/resetKeysPopup'
import ResetPasswordDialog from '../components/popups/resetPasswordDialog'

import { signOut, unlock, changeEncryptionPassword } from '../actions/viewerAccount'

import { selectPopup, selectPopupData, showPasswordReset, closePopup } from '../bundles/account'

export default (props) => {
  const popup = useSelector(selectPopup)
  const data = useSelector(selectPopupData)

  const dispatch = useDispatch()

  const doClosePopup = () => dispatch(closePopup())
  const doSignOut = () => dispatch(signOut())
  const doUnlock = cryptoPassword => dispatch(unlock(cryptoPassword))
  const displayResetPassword = type => dispatch(showPasswordReset(type))
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
