import React from 'react'

import Popup from './popup'

import styles from './unlockAndSignOut.module.css'
import formStyles from '../formElements.module.css'

export default function SignOutPopup ({ onCancel, onSignOut }) {
  return <Popup title='Sign Out?' onClose={onCancel}>
    <div className={styles.ButtonsRow}>
      <button className={formStyles.SecondaryButton} onClick={onCancel}>cancel</button>
      <button className={formStyles.DangerButton} onClick={onSignOut}>sign out</button>
    </div>
  </Popup>
}
