import React from 'react'
import { Portal } from 'react-portal'
import { useSelector, useDispatch } from 'react-redux'

import Popup from '../components/popups/popup'
import UnlockDialog from '../components/modals/unlockDialog'
import ResetKeysPopup from '../components/popups/resetKeysPopup'
import ResetPasswordDialog from '../components/popups/resetPasswordDialog'

import { signOut, changeEncryptionPassword } from '../actions/viewerAccount'

import { selectPopup, selectPopupData, closePopup } from '../bundles/account'

export default (props) => {
  const popup = useSelector(selectPopup)
  const data = useSelector(selectPopupData)

  const dispatch = useDispatch()

  const doClosePopup = () => dispatch(closePopup())
  const doSignOut = () => dispatch(signOut())
  const doChangeEncryptionPassword = (resetKey, nextPassword) => dispatch(
    changeEncryptionPassword(resetKey, nextPassword)
  )

  if (popup == null || popup.length === 0) return null

  switch (popup) {
    case 'unlock':
      return <Portal>
        <UnlockDialog />
      </Portal>

    case 'resetKeys':
      return <Portal>
        <ResetKeysPopup onClose={doClosePopup} resetKeys={data} />
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
