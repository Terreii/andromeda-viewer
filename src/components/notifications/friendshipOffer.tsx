import React from 'react'
import { useDispatch } from 'react-redux'

import { Container, ComponentArguments, ButtonsRow } from './utils'
import Name from '../name'
import Text from '../text'

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

  return (
    <Container title={<span><Name id={data.fromId} /> has offered you friendship.</span>}>
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
