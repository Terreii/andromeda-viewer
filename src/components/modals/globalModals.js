import React from 'react'
import { useSelector } from 'react-redux'

import ErrorDialog from './error'
import FirstRunDialog from './firstRunDialog'
import ResetKeysPopup from './resetKeys'
import UnlockDialog from './unlockDialog'

import { selectShowUnlockDialog, selectResetKeys } from '../../bundles/account'
import { selectErrorMessage } from '../../bundles/session'

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
  } else if (true) {
    return <FirstRunDialog />
  } else {
    return null
  }
})
