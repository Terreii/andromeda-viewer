import React from 'react'

import { Container, Text } from './utils'

import formStyles from '../formElements.module.css'
import styles from './notifications.module.css'

export default function FriendshipOffer ({ data, onAccept, onDecline, onClose }) {
  const onAcceptFriendship = () => {
    onAccept(data.fromId, data.sessionId)
    onClose(data.id)
  }

  const onDeclineFriendship = () => {
    onDecline(data.fromId, data.sessionId)
    onClose(data.id)
  }

  return <Container title={`${data.fromAgentName} has offered you friendship.`}>
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
