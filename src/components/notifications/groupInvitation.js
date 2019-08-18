import React from 'react'

import { Container, Text } from './utils'

import formStyles from '../formElements.module.css'
import styles from './notifications.module.css'

const numberFormater = Intl && Intl.NumberFormat
  ? Intl.NumberFormat()
  : {
    format: number => number.toString()
  }

export default function GroupInvitation ({ data, onAccept, onDecline, onClose }) {
  const fee = numberFormater.format(data.fee)

  return <Container title={'Invitation to join a group'}>
    <Text text={data.text} />

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
          onClose(data.id)
        }}
      >
        Accept
      </button>

      <button
        className={formStyles.DangerButton}
        onClick={() => {
          onDecline(data.transactionId, data.groupId)
          onClose(data.id)
        }}
      >
        Decline
      </button>
    </div>
  </Container>
}
