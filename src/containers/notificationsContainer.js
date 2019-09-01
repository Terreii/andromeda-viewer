import React from 'react'
import { bindActionCreators } from 'redux'
import { useSelector, useDispatch } from 'react-redux'

import { closeNotification } from '../actions/chatMessageActions'
import {
  acceptFriendshipOffer,
  declineFriendshipOffer,
  offerTeleportLure
} from '../actions/friendsActions'
import {
  acceptGroupInvitation,
  declineGroupInvitation,
  acceptGroupNoticeItem,
  declineGroupNoticeItem
} from '../actions/groupsActions'

import { getNotifications } from '../selectors/chat'

import NotificationsView from '../components/notifications'

export default function NotificationsContainer (props) {
  const notifications = useSelector(getNotifications)
  const dispatch = useDispatch()

  const actions = bindActionCreators({
    closeNotification,
    acceptFriendshipOffer,
    declineFriendshipOffer,
    acceptGroupInvitation,
    declineGroupInvitation,
    acceptGroupNoticeItem,
    declineGroupNoticeItem,
    offerTeleport: offerTeleportLure
  }, dispatch)

  return <NotificationsView
    notifications={notifications}
    acceptFriendship={actions.acceptFriendshipOffer}
    declineFriendship={actions.declineFriendshipOffer}
    acceptGroupInvite={actions.acceptGroupInvitation}
    declineGroupInvite={actions.declineGroupInvitation}
    acceptGroupNoticeItem={actions.acceptGroupNoticeItem}
    declineGroupNoticeItem={actions.declineGroupNoticeItem}
    offerTeleport={actions.offerTeleport}
    onClose={actions.closeNotification}
  />
}
