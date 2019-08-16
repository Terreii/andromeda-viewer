import React from 'react'

import { Container, Text } from './utils'

import { NotificationTypes } from '../../types/chat'

import formStyles from '../formElements.module.css'
import styles from './notifications.module.css'

export default function TextNotification ({ data, onClose }) {
  const title = data.notificationType === NotificationTypes.System
    ? 'System Notification'
    : data.fromName

  return <Container title={title}>
    <Text text={data.text} />

    <div className={styles.ButtonsRow}>
      <button className={formStyles.PrimaryButton} onClick={() => { onClose(data.id) }}>
        OK
      </button>
    </div>
  </Container>
}
