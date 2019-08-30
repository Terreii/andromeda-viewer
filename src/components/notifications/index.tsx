import React from 'react'

import TextNotification from './textNotification'
import FriendshipOffer from './friendshipOffer'
import GroupInvitation from './groupInvitation'

import { NotificationTypes, Notification } from '../../types/chat'

import infoListStyles from '../infoList.module.css'

interface NotificationArgs {
  notifications: Notification[]
  acceptFriendship: (fromId: string, sessionId: string) => void
  declineFriendship: (fromId: string, sessionId: string) => void
  acceptGroupInvite: (transactionId: string, groupId: string) => void
  declineGroupInvite: (transactionId: string, groupId: string) => void
  onClose: (id: number) => void
}

export default function notificationsList ({
  notifications,
  acceptFriendship,
  declineFriendship,
  acceptGroupInvite,
  declineGroupInvite,
  onClose
}: NotificationArgs) {
  return <main className={infoListStyles.Container} aria-label='Notifications'>
    <div className={infoListStyles.NotificationList}>
      {notifications.map(notification => {
        const doClose = () => onClose(notification.id!)

        switch (notification.notificationType) {
          case NotificationTypes.TextOnly:
          case NotificationTypes.System:
            return <TextNotification
              key={notification.id}
              data={notification}
              onClose={doClose}
            />

          case NotificationTypes.FriendshipOffer:
            return <FriendshipOffer
              key={notification.id}
              data={notification}
              onAccept={acceptFriendship}
              onDecline={declineFriendship}
              onClose={doClose}
            />

          case NotificationTypes.GroupInvitation:
            return <GroupInvitation
              key={notification.id}
              data={notification}
              onAccept={acceptGroupInvite}
              onDecline={declineGroupInvite}
              onClose={doClose}
            />

          default:
            return <TextNotification
              key={notification.id}
              data={{
                id: notification.id,
                notificationType: NotificationTypes.TextOnly,
                text: notification.text,
                fromName: 'Unknown'
              }}
              onClose={doClose}
            />
        }
      })}
    </div>
  </main>
}
