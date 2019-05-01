import { connect } from 'react-redux'

import { closeNotification } from '../actions/chatMessageActions'
import { acceptFriendshipOffer, declineFriendshipOffer } from '../actions/friendsActions'

import { getNotifications } from '../selectors/chat'

import NotificationsView from '../components/notifications'

const mapStateToProps = state => {
  return {
    notifications: getNotifications(state)
  }
}

const mapDispatchToProps = {
  acceptFriendship: acceptFriendshipOffer,
  declineFriendship: declineFriendshipOffer,
  onClose: closeNotification
}

export default connect(mapStateToProps, mapDispatchToProps)(NotificationsView)
