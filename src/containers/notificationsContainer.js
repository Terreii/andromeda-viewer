import { connect } from 'react-redux'

import { closeNotification } from '../actions/chatMessageActions'

import { getNotifications } from '../selectors/chat'

import NotificationsView from '../components/notifications'

const mapStateToProps = state => {
  return {
    notifications: getNotifications(state)
  }
}

const mapDispatchToProps = {
  onCancel: closeNotification
}

export default connect(mapStateToProps, mapDispatchToProps)(NotificationsView)
