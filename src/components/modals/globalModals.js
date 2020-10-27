import { memo } from 'react'
import { useSelector } from 'react-redux'

import ErrorDialog from './error'
import UnlockDialog from './unlockDialog'
import ResetKeysPopup from './resetKeys'

import { selectShowUnlockDialog, selectResetKeys } from '../../bundles/account'
import { selectErrorMessage } from '../../bundles/session'

export default memo(() => {
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
