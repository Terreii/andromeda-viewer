import React from 'react'

import { Container, Text } from './utils'

import { TeleportLure } from '../../types/chat'

import formStyles from '../formElements.module.css'
import styles from './notifications.module.css'

interface NotificationArgs {
  data: TeleportLure
  onAccept: (fromId: string, sessionId: string) => void
  onDecline: (fromId: string, sessionId: string) => void
  onClose: () => void
}

export default function FriendshipOffer ({ data, onAccept, onDecline, onClose }: NotificationArgs) {
  const doAccept = () => {
    onAccept(data.fromId, data.lureId)
    onClose()
  }
  const doDecline = () => {
    onDecline(data.fromId, data.lureId)
    onClose()
  }

  return <Container title={`${data.fromAgentName} has offered to teleport you to their location.`}>
    <Text text={data.text} />

    <div className={styles.ButtonsRow}>
      <button className={formStyles.OkButton} onClick={doAccept} disabled>
        Accept (not jet implemented)
      </button>

      <button className={formStyles.DangerButton} onClick={doDecline}>
        Decline
      </button>
    </div>
  </Container>
}
