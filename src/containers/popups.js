import React from 'react'
import { Portal } from 'react-portal'
import { useSelector, useDispatch } from 'react-redux'

import Popup from '../components/popups/popup'
import UnlockDialog from '../components/modals/unlockDialog'
import ResetKeysPopup from '../components/popups/resetKeysPopup'

import { selectPopup, selectPopupData, closePopup } from '../bundles/account'

export default (props) => {
  const popup = useSelector(selectPopup)
  const data = useSelector(selectPopupData)

  const dispatch = useDispatch()

  const doClosePopup = () => dispatch(closePopup())

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

    default:
      return <Portal>
        <Popup title={'Error'} onClose={doClosePopup}>
          {popup}
        </Popup>
      </Portal>
  }
}
