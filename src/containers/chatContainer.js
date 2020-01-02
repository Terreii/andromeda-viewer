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
import { selectGroups } from '../reducers/groups'
import { selectActiveIMChats } from '../reducers/imChat'
import { selectLocalChat } from '../reducers/localChat'
import { selectNames } from '../reducers/names'
import { selectShouldDisplayNotifications } from '../reducers/notifications'
import { selectActiveTab } from '../reducers/session'

import ChatBox from '../components/chatBox'

const mapStateToProps = state => {
  return {
    activeTab: selectActiveTab(state),
    friends: selectFriends(state),
    groups: selectGroups(state),
    IMs: selectActiveIMChats(state),
    localChat: selectLocalChat(state),
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
