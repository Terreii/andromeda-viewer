import { connect } from 'react-redux'

import {
  sendLocalChatMessage,
  sendInstantMessage,
  startNewIMChat,
  getIMHistory
} from '../actions/chatMessageActions'
import { updateRights } from '../actions/friendsActions'

import { selectFriends } from '../bundles/friends'
import { selectGroups } from '../bundles/groups'
import { selectActiveIMChats } from '../bundles/imChat'
import { selectLocalChat } from '../bundles/localChat'
import { selectNames } from '../bundles/names'
import { selectShouldDisplayNotifications } from '../bundles/notifications'
import { selectActiveTab, changeChatTab } from '../bundles/session'

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
  changeTab: changeChatTab,
  sendLocalChatMessage: text => sendLocalChatMessage(text, 1, 0),
  sendInstantMessage,
  startNewIMChat,
  getIMHistory,
  updateRights
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatBox)
