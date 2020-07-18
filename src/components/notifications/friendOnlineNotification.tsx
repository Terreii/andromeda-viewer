import React from 'react'

import { Container, ComponentArguments, ButtonsRow } from './utils'

import { useName } from '../../hooks/names'

import { FriendOnlineStateChangeNotification } from '../../types/chat'

export default function TextNotificationComponent (
  { data, onClose }: ComponentArguments<FriendOnlineStateChangeNotification>
) {
  const friendName = useName(data.friendId)
  const stateText = data.online ? 'online' : 'offline'

  return (
    <Container title={`Friend went ${stateText}`}>
      <p>{`${friendName?.getDisplayName() ?? data.friendId} is ${stateText}`}</p>

      <ButtonsRow>
        <button className='btn btn--primary' onClick={onClose}>
          OK
        </button>
      </ButtonsRow>
    </Container>
  )
}
