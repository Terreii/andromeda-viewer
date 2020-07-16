import React from 'react'
import { useDispatch } from 'react-redux'

import { Container, ComponentArguments } from './utils'
import Text from '../text'

import { acceptGroupInvitation, declineGroupInvitation } from '../../actions/groupsActions'

import { GroupInvitationNotification } from '../../types/chat'

import styles from './notifications.module.css'

const numberFormater = Intl && Intl.NumberFormat
  ? Intl.NumberFormat()
  : {
    format: (number: Number) => number.toString()
  }

export default function GroupInvitation (
  { data, onClose }: ComponentArguments<GroupInvitationNotification>
) {
  const dispatch = useDispatch()

  const fee = numberFormater.format(data.fee)

  return (
    <Container title='Invitation to join a group'>
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
          className='btn btn-ok'
          onClick={() => {
            dispatch(acceptGroupInvitation(data.transactionId, data.groupId))
            onClose()
          }}
        >
          Accept
        </button>

        <button
          className='btn btn-danger'
          onClick={() => {
            dispatch(declineGroupInvitation(data.transactionId, data.groupId))
            onClose()
          }}
        >
          Decline
        </button>
      </div>
    </Container>
  )
}
