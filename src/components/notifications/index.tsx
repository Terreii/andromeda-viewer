import React from 'react'

import TextNotification from './textNotification'
import FriendshipOffer from './friendshipOffer'
import GroupInvitation from './groupInvitation'
import GroupNotice from './groupNotice'
import LoadURL from './loadURL'
import RequestTeleportLure from './requestTeleportLure'
import TeleportLure from './teleportLure'
import InventoryOffer from './inventoryOffer'

import { NotificationTypes, Notification } from '../../types/chat'
import { AssetType } from '../../types/inventory'

import infoListStyles from '../infoList.module.css'

interface NotificationArgs {
  notifications: Notification[]
  acceptGroupInvite: (transactionId: string, groupId: string) => void
  declineGroupInvite: (transactionId: string, groupId: string) => void
  offerTeleport: (target: string) => void
  acceptTeleportLure: (fromId: string, sessionId: string) => void
  declineTeleportLure: (fromId: string, sessionId: string) => void
  acceptInventoryOffer: (
    fromId: string,
    transactionId: string,
    assetType: AssetType,
    isFromGroup?: boolean,
    isFromObject?: boolean
  ) => void,
  declineInventoryOffer: (
    fromId: string,
    transactionId: string,
    isFromGroup?: boolean,
    isFromObject?: boolean
  ) => void
  onClose: (id: number) => void
}

export default function notificationsList ({
  notifications,
  acceptGroupInvite,
  declineGroupInvite,
  offerTeleport,
  acceptTeleportLure,
  declineTeleportLure,
  acceptInventoryOffer,
  declineInventoryOffer,
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
              onAccept={acceptInventoryOffer}
              onDecline={declineInventoryOffer}
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

          case NotificationTypes.InventoryOffered:
            return <InventoryOffer
              key={notification.id}
              data={notification}
              onAccept={acceptInventoryOffer}
              onDecline={declineInventoryOffer}
              onClose={doClose}
            />

          case NotificationTypes.ScriptDialog:
          case NotificationTypes.Permissions:
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

          default:
            throw new TypeError('unknown NotificationType')
        }
      })}
    </div>
  </main>
}
