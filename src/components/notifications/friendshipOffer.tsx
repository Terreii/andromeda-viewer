import React from 'react'
import { useDispatch } from 'react-redux'

import { Container, ComponentArguments } from './utils'
import Text from '../text'

import { useName } from '../../hooks/names'

import { acceptFriendshipOffer, declineFriendshipOffer } from '../../actions/friendsActions'

import { FriendshipOfferNotification } from '../../types/chat'

import formStyles from '../formElements.module.css'
import styles from './notifications.module.css'

export default function FriendshipOffer (
  { data, onClose }: ComponentArguments<FriendshipOfferNotification>
) {
  const dispatch = useDispatch()

  const onAccept = () => {
    dispatch(acceptFriendshipOffer(data.fromId, data.sessionId))
    onClose()
  }

  const onDecline = () => {
    dispatch(declineFriendshipOffer(data.fromId, data.sessionId))
    onClose()
  }

  const name = useName(data.fromId)

  return <Container title={`${name} has offered you friendship.`}>
    <p>
      <Text text={data.text} multiline />
    </p>

    <div className={styles.ButtonsRow}>
      <button className={formStyles.OkButton} onClick={onAccept}>
        Accept
      </button>

      <button className={formStyles.DangerButton} onClick={onDecline}>
        Decline
      </button>
    </div>
  </Container>
}
