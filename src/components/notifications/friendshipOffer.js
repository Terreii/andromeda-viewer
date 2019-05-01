import React from 'react'

import { Button } from '../formElements'
import { NotificationBorder, Text, ButtonsRow } from './utils'

export default function FriendshipOffer ({ data, onAccept, onDecline, onClose }) {
  const onAcceptFriendship = () => {
    onAccept(data.fromId, data.sessionId)
    onClose(data.id)
  }

  const onDeclineFriendship = () => {
    onDecline(data.fromId, data.sessionId)
    onClose(data.id)
  }

  return <NotificationBorder>
    <h4>{`${data.fromAgentName} has offered you friendship.`}</h4>

    <Text text={data.text} />

    <ButtonsRow>
      <Button className='ok' onClick={onAcceptFriendship}>
        Accept
      </Button>

      <Button className='danger' onClick={onDeclineFriendship}>
        Decline
      </Button>
    </ButtonsRow>
  </NotificationBorder>
}
