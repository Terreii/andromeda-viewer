import React, { useMemo } from 'react'
import { bindActionCreators } from 'redux'
import { useSelector, useDispatch } from 'react-redux'

import { close as closeNotification, selectNotifications } from '../bundles/notifications'
import {
  offerTeleportLure,
  acceptTeleportLure,
  declineTeleportLure
} from '../actions/friendsActions'
import { acceptGroupInvitation, declineGroupInvitation } from '../actions/groupsActions'
import { acceptInventoryOffer, declineInventoryOffer } from '../actions/inventory'

import NotificationsView from '../components/notifications'

export default function NotificationsContainer () {
  const notifications = useSelector(selectNotifications)
  const dispatch = useDispatch()

  const actions = useMemo(() => bindActionCreators({
    closeNotification,
    acceptGroupInvitation,
    declineGroupInvitation,
    acceptInventoryOffer,
    declineInventoryOffer,
    offerTeleport: offerTeleportLure,
    acceptTeleportLure,
    declineTeleportLure
  }, dispatch), [dispatch])

  return <NotificationsView
    notifications={notifications}
    acceptGroupInvite={actions.acceptGroupInvitation}
    declineGroupInvite={actions.declineGroupInvitation}
    acceptInventoryOffer={actions.acceptInventoryOffer}
    declineInventoryOffer={actions.declineInventoryOffer}
    offerTeleport={actions.offerTeleport}
    acceptTeleportLure={actions.acceptTeleportLure}
    declineTeleportLure={actions.declineTeleportLure}
    onClose={actions.closeNotification}
  />
}
