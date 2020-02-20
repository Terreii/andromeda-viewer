import React from 'react'

import { Container } from './utils'
import Text from '../text'

import { useName } from '../../hooks/names'

import { RequestTeleportLureNotification } from '../../types/chat'

import formStyles from '../formElements.module.css'
import styles from './notifications.module.css'

interface NotificationArgs {
  data: RequestTeleportLureNotification
  onAccept: (target: string) => void
  onClose: () => void
}

export default function RequestTeleportLure ({ data, onAccept, onClose }: NotificationArgs) {
  const name = useName(data.fromId)

  return <Container title={`${name} is requesting to be teleported to your location.`}>
    <p>
      <Text text={data.text} multiline />
    </p>

    <div className={styles.ButtonsRow}>
      <button
        className={formStyles.OkButton}
        onClick={() => {
          onAccept(data.fromId)
          onClose()
        }}
      >
        Accept
      </button>

      <button className={formStyles.DangerButton} onClick={onClose}>
        Decline
      </button>
    </div>
  </Container>
}
