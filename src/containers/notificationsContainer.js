import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { closeNotification } from '../actions/chatMessageActions'
import { acceptFriendshipOffer, declineFriendshipOffer } from '../actions/friendsActions'

import { getNotifications } from '../selectors/chat'

import NotificationsView from '../components/notifications'

export default function NotificationsContainer (props) {
  const notifications = useSelector(getNotifications)
  const dispatch = useDispatch()

  const acceptFriendship = (fromId, sessionId) => dispatch(
    acceptFriendshipOffer(fromId, sessionId)
  )
  const declineFriendship = (fromId, sessionId) => dispatch(
    declineFriendshipOffer(fromId, sessionId)
  )
  const onClose = id => dispatch(closeNotification(id))

  return <NotificationsView
    notifications={notifications}
    acceptFriendship={acceptFriendship}
    declineFriendship={declineFriendship}
    onClose={onClose}
  />
}
