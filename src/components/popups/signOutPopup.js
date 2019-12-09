import React from 'react'

import Popup from './popup'

import styles from './unlockAndSignOut.module.css'
import formStyles from '../formElements.module.css'

import { useAutoFocus } from '../../hooks/utils'

export default function SignOutPopup ({ onCancel, onSignOut }) {
  const doAutoFocus = useAutoFocus()

  return <Popup title='Sign Out?' onClose={onCancel}>
    <div className={styles.ButtonsRow}>
      <button className={formStyles.DangerButton} onClick={onSignOut} ref={doAutoFocus}>
        sign out
      </button>
      <button className={formStyles.SecondaryButton} onClick={onCancel}>
        cancel
      </button>
    </div>
  </Popup>
}
