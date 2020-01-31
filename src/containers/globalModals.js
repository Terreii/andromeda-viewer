import React from 'react'
import { useSelector } from 'react-redux'

import ErrorDialog from '../components/modals/error'
import UnlockDialog from '../components/modals/unlockDialog'
import ResetKeysPopup from '../components/modals/resetKeys'

import { selectShowUnlockDialog, selectResetKeys } from '../bundles/account'
import { selectErrorMessage } from '../bundles/session'

export default React.memo(() => {
  const showUnlockDialog = useSelector(selectShowUnlockDialog)
  const resetKeys = useSelector(selectResetKeys)
  const errorMessage = useSelector(selectErrorMessage)

  if (showUnlockDialog) {
    return <UnlockDialog />
  } else if (resetKeys != null && resetKeys.length > 0) {
    return <ResetKeysPopup resetKeys={resetKeys} />
  } else if (errorMessage != null) {
    return <ErrorDialog errorMessage={errorMessage} />
  } else {
    return null
  }
})
