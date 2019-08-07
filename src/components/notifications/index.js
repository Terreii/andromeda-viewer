import React from 'react'
import styled from 'styled-components'

import TextNotification from './textNotification'
import FriendshipOffer from './friendshipOffer'

import { NotificationTypes } from '../../types/chat'

const Outer = styled.main`
  padding: 1em;
`

const ListTitle = styled.div`
  font-size: 120%;
  border-bottom: 1px solid grey;
`

const Content = styled.div`
  max-width: 15cm;
  margin-top: .5em;
  margin-left: auto;
  margin-right: auto;
`

export default function notificationsList ({
  notifications,
  acceptFriendship,
  declineFriendship,
  onClose
}) {
  return <Outer>
    <ListTitle>Notifications</ListTitle>
    <Content>
      {notifications.map(notification => {
        switch (notification.notificationType) {
          case NotificationTypes.FriendshipOffer:
            return <FriendshipOffer
              key={notification.id}
              data={notification}
              onAccept={acceptFriendship}
              onDecline={declineFriendship}
              onClose={onClose}
            />

          case NotificationTypes.TextOnly:
          case NotificationTypes.System:
          default:
            return <TextNotification
              key={notification.id}
              data={notification}
              onClose={onClose}
            />
        }
      })}
    </Content>
  </Outer>
}
