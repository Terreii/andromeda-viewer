import React from 'react'

import { Container, ComponentArguments } from './utils'

import { useName } from '../../hooks/names'

import { FriendOnlineStateChangeNotification } from '../../types/chat'

import formStyles from '../formElements.module.css'
import styles from './notifications.module.css'

export default function TextNotificationComponent (
  { data, onClose }: ComponentArguments<FriendOnlineStateChangeNotification>
) {
  const friendName = useName(data.friendId)
  const stateText = data.online ? 'online' : 'offline'

  return (
    <Container title={`Friend went ${stateText}`}>
      <p>{`${friendName?.getDisplayName() ?? data.friendId} is ${stateText}`}</p>

      <div className={styles.ButtonsRow}>
        <button className={formStyles.PrimaryButton} onClick={onClose}>
          OK
        </button>
      </div>
    </Container>
  )
}
