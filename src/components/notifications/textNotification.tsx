import React from 'react'

import { Container, ComponentArguments } from './utils'
import Text from '../text'

import { NotificationTypes, TextNotification, SystemNotification } from '../../types/chat'

import formStyles from '../formElements.module.css'
import styles from './notifications.module.css'

export default function TextNotificationComponent (
  { data, onClose }: ComponentArguments<TextNotification | SystemNotification>
) {
  const title = data.notificationType === NotificationTypes.System
    ? 'System Notification'
    : data.fromName

  return <Container title={title}>
    <p>
      <Text text={data.text} multiline />
    </p>

    <div className={styles.ButtonsRow}>
      <button className={formStyles.PrimaryButton} onClick={onClose}>
        OK
      </button>
    </div>
  </Container>
}
