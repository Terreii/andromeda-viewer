import { connect } from 'react-redux'

import {
  changeTab,
  sendLocalChatMessage,
  sendInstantMessage,
  startNewIMChat,
  getIMHistory,
  closeNotification
} from '../actions/chatMessageActions'
import { updateRights } from '../actions/friendsActions'

import {
  getActiveTab,
  getLocalChat,
  getActiveIMChats,
  getNotifications,
  getShouldDisplayNotifications
} from '../selectors/chat'
import { getNames } from '../selectors/names'
import { getFriends } from '../selectors/people'
import { getGroups } from '../selectors/groups'

import ChatBox from '../components/chatBox'

const mapStateToProps = state => {
  return {
    activeTab: getActiveTab(state),
    localChat: getLocalChat(state),
    IMs: getActiveIMChats(state),
    shouldDisplayNotifications: getShouldDisplayNotifications(state),
    notifications: getNotifications(state),
    groups: getGroups(state),
    names: getNames(state),
    friends: getFriends(state)
  }
}

const mapDispatchToProps = {
  changeTab,
  sendLocalChatMessage: text => sendLocalChatMessage(text, 1, 0),
  sendInstantMessage,
  startNewIMChat,
  getIMHistory,
  closeNotification,
  updateRights
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatBox)
