import { memo } from 'react'
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

export default memo(function NotificationsList () {
  const notifications = useSelector(selectNotifications)
  const dispatch = useDispatch()

  return (
    <main
      className='p-4 mt-1 overflow-y-scroll focus:ring focus:outline-none'
      tabIndex={0}
      aria-label='Notifications'
    >
      <div className='max-w-xl mx-auto mt-2 space-y-2 list-none'>
        {notifications.map(notification => {
          const doClose = () => dispatch(close(notification.id ?? 0))

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

            default:
              throw new TypeError('unknown NotificationType')
          }
        })}
      </div>
    </main>
  )
})
