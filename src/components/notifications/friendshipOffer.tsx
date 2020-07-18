import React from 'react'
import { useDispatch } from 'react-redux'

import { Container, ComponentArguments, ButtonsRow } from './utils'
import Text from '../text'

import { useName } from '../../hooks/names'

import { acceptFriendshipOffer, declineFriendshipOffer } from '../../actions/friendsActions'

import { FriendshipOfferNotification } from '../../types/chat'

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

  return (
    <Container title={`${name} has offered you friendship.`}>
      <p>
        <Text text={data.text} multiline />
      </p>

      <ButtonsRow>
        <button className='btn btn--ok' onClick={onAccept}>
          Accept
        </button>

        <button className='btn btn--danger' onClick={onDecline}>
          Decline
        </button>
      </ButtonsRow>
    </Container>
  )
}
