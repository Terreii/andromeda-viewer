import React from 'react'
import { useSelector } from 'react-redux'

import UnlockDialog from '../components/modals/unlockDialog'
import ResetKeysPopup from '../components/modals/resetKeys'

import { selectShowUnlockDialog, selectResetKeys } from '../bundles/account'

export default (props) => {
  const showUnlockDialog = useSelector(selectShowUnlockDialog)
  const resetKeys = useSelector(selectResetKeys)

  if (showUnlockDialog) {
    return <UnlockDialog />
  } else if (resetKeys != null && resetKeys.length > 0) {
    return <ResetKeysPopup resetKeys={resetKeys} />
  } else {
    return null
  }
}
