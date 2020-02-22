import React, { useMemo } from 'react'
import { bindActionCreators } from 'redux'
import { useSelector, useDispatch } from 'react-redux'

import { close as closeNotification, selectNotifications } from '../bundles/notifications'

import NotificationsView from '../components/notifications'

export default function NotificationsContainer () {
  const notifications = useSelector(selectNotifications)
  const dispatch = useDispatch()

  const actions = useMemo(() => bindActionCreators({
    closeNotification
  }, dispatch), [dispatch])

  return <NotificationsView
    notifications={notifications}
    onClose={actions.closeNotification}
  />
}
