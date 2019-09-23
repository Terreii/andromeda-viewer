import React from 'react'

import { Container, Text } from './utils'

import { useName } from '../../hooks/names'

import { FriendshipOfferNotification } from '../../types/chat'

import formStyles from '../formElements.module.css'
import styles from './notifications.module.css'

interface NotificationArgs {
  data: FriendshipOfferNotification
  onAccept: (fromId: string, sessionId: string) => void
  onDecline: (fromId: string, sessionId: string) => void
  onClose: () => void
}

export default function FriendshipOffer ({ data, onAccept, onDecline, onClose }: NotificationArgs) {
  const onAcceptFriendship = () => {
    onAccept(data.fromId, data.sessionId)
    onClose()
  }

  const onDeclineFriendship = () => {
    onDecline(data.fromId, data.sessionId)
    onClose()
  }

  const name = useName(data.fromId)

  return <Container title={`${name} has offered you friendship.`}>
    <Text text={data.text} />

    <div className={styles.ButtonsRow}>
      <button className={formStyles.OkButton} onClick={onAcceptFriendship}>
        Accept
      </button>

      <button className={formStyles.DangerButton} onClick={onDeclineFriendship}>
        Decline
      </button>
    </div>
  </Container>
}
