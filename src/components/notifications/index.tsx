import React from 'react'

import TextNotification from './textNotification'
import FriendshipOffer from './friendshipOffer'
import GroupInvitation from './groupInvitation'
import GroupNotice from './groupNotice'
import LoadURL from './loadURL'
import RequestTeleportLure from './requestTeleportLure'
import TeleportLure from './teleportLure'

import { NotificationTypes, Notification } from '../../types/chat'
import { AssetType } from '../../types/inventory'

import infoListStyles from '../infoList.module.css'

interface NotificationArgs {
  notifications: Notification[]
  acceptFriendship: (fromId: string, sessionId: string) => void
  declineFriendship: (fromId: string, sessionId: string) => void
  acceptGroupInvite: (transactionId: string, groupId: string) => void
  declineGroupInvite: (transactionId: string, groupId: string) => void
  acceptGroupNoticeItem: (target: string, transactionId: string, assetType: AssetType) => void
  declineGroupNoticeItem: (target: string, transactionId: string) => void
  offerTeleport: (target: string) => void
  acceptTeleportLure: (fromId: string, sessionId: string) => void
  declineTeleportLure: (fromId: string, sessionId: string) => void
  onClose: (id: number) => void
}

export default function notificationsList ({
  notifications,
  acceptFriendship,
  declineFriendship,
  acceptGroupInvite,
  declineGroupInvite,
  acceptGroupNoticeItem,
  declineGroupNoticeItem,
  offerTeleport,
  acceptTeleportLure,
  declineTeleportLure,
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

          case NotificationTypes.GroupNotice:
            return <GroupNotice
              key={notification.id}
              data={notification}
              onAccept={acceptGroupNoticeItem}
              onDecline={declineGroupNoticeItem}
              onClose={doClose}
            />

          case NotificationTypes.LoadURL:
            return <LoadURL
              key={notification.id}
              data={notification}
              onClose={doClose}
            />

          case NotificationTypes.RequestTeleportLure:
            return <RequestTeleportLure
              key={notification.id}
              data={notification}
              onAccept={offerTeleport}
              onClose={doClose}
            />

          case NotificationTypes.TeleportLure:
            return <TeleportLure
              key={notification.id}
              data={notification}
              onAccept={acceptTeleportLure}
              onDecline={declineTeleportLure}
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
