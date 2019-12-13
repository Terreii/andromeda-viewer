import { connect } from 'react-redux'

import {
  changeTab,
  sendLocalChatMessage,
  sendInstantMessage,
  startNewIMChat,
  getIMHistory
} from '../actions/chatMessageActions'
import { updateRights } from '../actions/friendsActions'

import { selectFriends } from '../reducers/friends'
import { selectNames } from '../reducers/names'
import { selectShouldDisplayNotifications } from '../reducers/notifications'

import { getActiveTab, getLocalChat, getActiveIMChats } from '../selectors/chat'
import { getGroups } from '../selectors/groups'

import ChatBox from '../components/chatBox'

const mapStateToProps = state => {
  return {
    activeTab: getActiveTab(state),
    friends: selectFriends(state),
    groups: getGroups(state),
    IMs: getActiveIMChats(state),
    localChat: getLocalChat(state),
    names: selectNames(state),
    shouldDisplayNotifications: selectShouldDisplayNotifications(state)
  }
}

const mapDispatchToProps = {
  changeTab,
  sendLocalChatMessage: text => sendLocalChatMessage(text, 1, 0),
  sendInstantMessage,
  startNewIMChat,
  getIMHistory,
  updateRights
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatBox)
