import React from 'react'

import { Container } from './utils'
import Text from '../text'

import { GroupInvitationNotification } from '../../types/chat'

import formStyles from '../formElements.module.css'
import styles from './notifications.module.css'

const numberFormater = Intl && Intl.NumberFormat
  ? Intl.NumberFormat()
  : {
    format: (number: Number) => number.toString()
  }

interface NotificationArgs {
  data: GroupInvitationNotification
  onAccept: (transactionId: string, groupId: string) => void
  onDecline: (transactionId: string, groupId: string) => void
  onClose: () => void
}
  
  
export default function GroupInvitation ({ data, onAccept, onDecline, onClose }: NotificationArgs) {
  const fee = numberFormater.format(data.fee)

  return <Container title={'Invitation to join a group'}>
    <p>
      <Text text={data.text} multiline />
    </p>

    <span>
      {'Fee: '}
      <span className={styles.Fee}>
        {fee}
        <span aria-label='Linden Dollar'>L$</span>
      </span>
    </span>

    <div className={styles.ButtonsRow}>
      <button
        className={formStyles.OkButton}
        onClick={() => {
          onAccept(data.transactionId, data.groupId)
          onClose()
        }}
      >
        Accept
      </button>

      <button
        className={formStyles.DangerButton}
        onClick={() => {
          onDecline(data.transactionId, data.groupId)
          onClose()
        }}
      >
        Decline
      </button>
    </div>
  </Container>
}
