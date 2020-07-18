import React from 'react'
import { useDispatch } from 'react-redux'

import { Container, ComponentArguments } from './utils'
import Text from '../text'

import { offerTeleportLure } from '../../actions/friendsActions'

import { useName } from '../../hooks/names'

import { RequestTeleportLureNotification } from '../../types/chat'

import styles from './notifications.module.css'

export default function RequestTeleportLure (
  { data, onClose }: ComponentArguments<RequestTeleportLureNotification>
) {
  const dispatch = useDispatch()

  const name = useName(data.fromId)

  return (
    <Container title={`${name} is requesting to be teleported to your location.`}>
      <p>
        <Text text={data.text} multiline />
      </p>

      <div className={styles.ButtonsRow}>
        <button
          className='btn btn--ok'
          onClick={() => {
            dispatch(offerTeleportLure(data.fromId))
            onClose()
          }}
        >
          Accept
        </button>

        <button className='btn btn--danger' onClick={onClose}>
          Decline
        </button>
      </div>
    </Container>
  )
}
