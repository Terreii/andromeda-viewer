import React from 'react'

import Modal from './modal'

import styles from './unlockAndSignOut.module.css'
import formStyles from '../formElements.module.css'

import { useAutoFocus } from '../../hooks/utils'

export default function SignOutModal ({ dialog, onSignOut }) {
  const doAutoFocus = useAutoFocus()

  return (
    <Modal title='Sign Out?' dialog={dialog} showOnClose backdrop>
      <div className={styles.ButtonsRow}>
        <button className={formStyles.DangerButton} onClick={onSignOut} ref={doAutoFocus}>
          sign out
        </button>
        <button
          className={formStyles.SecondaryButton}
          onClick={event => {
            event.preventDefault()
            dialog.hide()
          }}
        >
          cancel
        </button>
      </div>
    </Modal>
  )
}
