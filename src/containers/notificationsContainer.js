import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { closeNotification } from '../actions/chatMessageActions'
import { acceptFriendshipOffer, declineFriendshipOffer } from '../actions/friendsActions'
import { acceptGroupInvitation, declineGroupInvitation } from '../actions/groupsActions'

import { getNotifications } from '../selectors/chat'

import NotificationsView from '../components/notifications'

export default function NotificationsContainer (props) {
  const notifications = useSelector(getNotifications)
  const dispatch = useDispatch()

  const onClose = id => dispatch(closeNotification(id))

  const acceptFriendship = (fromId, sessionId) => dispatch(
    acceptFriendshipOffer(fromId, sessionId)
  )
  const declineFriendship = (fromId, sessionId) => dispatch(
    declineFriendshipOffer(fromId, sessionId)
  )

  const doAcceptGroupInvitation = (transactionId, groupId) => dispatch(
    acceptGroupInvitation(transactionId, groupId)
  )
  const doDeclineGroupInvitation = (transactionId, groupId) => dispatch(
    declineGroupInvitation(transactionId, groupId)
  )

  return <NotificationsView
    notifications={notifications}
    acceptFriendship={acceptFriendship}
    declineFriendship={declineFriendship}
    acceptGroupInvite={doAcceptGroupInvitation}
    declineGroupInvite={doDeclineGroupInvitation}
    onClose={onClose}
  />
}
