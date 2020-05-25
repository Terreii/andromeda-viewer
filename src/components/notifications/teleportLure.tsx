import React from 'react'
import { useDispatch } from 'react-redux'

import { Container, ComponentArguments } from './utils'
import Text from '../text'

import { acceptTeleportLure, declineTeleportLure } from '../../actions/friendsActions'

import { useName } from '../../hooks/names'

import { TeleportLure } from '../../types/chat'

import styles from './notifications.module.css'

export default function FriendshipOffer ({ data, onClose }: ComponentArguments<TeleportLure>) {
  const dispatch = useDispatch()

  const doAccept = () => {
    dispatch(acceptTeleportLure(data.fromId, data.lureId))
    onClose()
  }
  const doDecline = () => {
    dispatch(declineTeleportLure(data.fromId, data.lureId))
    onClose()
  }

  const name = useName(data.fromId)

  return (
    <Container title={`${name} has offered to teleport you to their location.`}>
      <p>
        <Text text={data.text} multiline />
      </p>

      <div className={styles.ButtonsRow}>
        <button className='btn btn-ok' onClick={doAccept} disabled>
          Accept (not yet implemented)
        </button>

        <button className='btn btn-danger' onClick={doDecline}>
          Decline
        </button>
      </div>
    </Container>
  )
}
