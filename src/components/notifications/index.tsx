import React, { memo } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import FriendOnlineNotification from './friendOnlineNotification'
import FriendshipOffer from './friendshipOffer'
import GroupInvitation from './groupInvitation'
import GroupNotice from './groupNotice'
import LoadURL from './loadURL'
import RequestTeleportLure from './requestTeleportLure'
import TeleportLure from './teleportLure'
import InventoryOffer from './inventoryOffer'
import TextNotification from './textNotification'

import { close, selectNotifications } from '../../bundles/notifications'

import { NotificationTypes } from '../../types/chat'

import infoListStyles from '../infoList.module.css'

export default memo(function NotificationsList () {
  const notifications = useSelector(selectNotifications)
  const dispatch = useDispatch()

  return (
    <main className={infoListStyles.Container} aria-label='Notifications'>
      <div className={infoListStyles.NotificationList}>
        {notifications.map(notification => {
          const doClose = () => dispatch(close(notification.id!))

          switch (notification.notificationType) {
            case NotificationTypes.TextOnly:
            case NotificationTypes.System:
              return (
                <TextNotification
                  key={notification.id}
                  data={notification}
                  onClose={doClose}
                />
              )

            case NotificationTypes.FriendshipOffer:
              return (
                <FriendshipOffer
                  key={notification.id}
                  data={notification}
                  onClose={doClose}
                />
              )

            case NotificationTypes.FriendOnlineStateChange:
              return (
                <FriendOnlineNotification
                  key={notification.id}
                  data={notification}
                  onClose={doClose}
                />
              )

            case NotificationTypes.GroupInvitation:
              return (
                <GroupInvitation
                  key={notification.id}
                  data={notification}
                  onClose={doClose}
                />
              )

            case NotificationTypes.GroupNotice:
              return (
                <GroupNotice
                  key={notification.id}
                  data={notification}
                  onClose={doClose}
                />
              )

            case NotificationTypes.LoadURL:
              return (
                <LoadURL
                  key={notification.id}
                  data={notification}
                  onClose={doClose}
                />
              )

            case NotificationTypes.RequestTeleportLure:
              return (
                <RequestTeleportLure
                  key={notification.id}
                  data={notification}
                  onClose={doClose}
                />
              )

            case NotificationTypes.TeleportLure:
              return (
                <TeleportLure
                  key={notification.id}
                  data={notification}
                  onClose={doClose}
                />
              )

            case NotificationTypes.InventoryOffered:
              return (
                <InventoryOffer
                  key={notification.id}
                  data={notification}
                  onClose={doClose}
                />
              )

            case NotificationTypes.ScriptDialog:
            case NotificationTypes.Permissions:
              return (
                <TextNotification
                  key={notification.id}
                  data={{
                    id: notification.id,
                    notificationType: NotificationTypes.TextOnly,
                    text: notification.text,
                    fromName: 'Unknown'
                  }}
                  onClose={doClose}
                />
              )
          }

          return ((): never => {
            throw new TypeError('unknown NotificationType')
          })()
        })}
      </div>
    </main>
  )
})
