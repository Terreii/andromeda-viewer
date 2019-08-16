import React from 'react'

import TextNotification from './textNotification'
import FriendshipOffer from './friendshipOffer'

import { NotificationTypes } from '../../types/chat'

import infoListStyles from '../infoList.module.css'

export default function notificationsList ({
  notifications,
  acceptFriendship,
  declineFriendship,
  onClose
}) {
  return <main className={infoListStyles.Container} aria-label='Notifications'>
    <div className={infoListStyles.NotificationList}>
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
    </div>
  </main>
}
