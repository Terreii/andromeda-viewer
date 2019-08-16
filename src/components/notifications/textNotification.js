import React from 'react'

import { Text } from './utils'

import { NotificationTypes } from '../../types/chat'

import formStyles from '../formElements.module.css'
import styles from './notifications.module.css'

export default function TextNotification ({ data, onClose }) {
  return <div className={styles.Border}>
    {data.notificationType === NotificationTypes.System
      ? <h4>
        System Notification
      </h4>
      : (data.fromName && <h4>{data.fromName}</h4>)
    }

    <Text text={data.text} />

    <div className={styles.ButtonsRow}>
      <button className={formStyles.PrimaryButton} onClick={() => { onClose(data.id) }}>
        OK
      </button>
    </div>
  </div>
}
