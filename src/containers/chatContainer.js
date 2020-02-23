import { connect } from 'react-redux'

import {
  sendLocalChatMessage,
  sendInstantMessage,
  startNewIMChat,
  getIMHistory
} from '../actions/chatMessageActions'
import { updateRights } from '../actions/friendsActions'
import { selectActiveIMChats } from '../bundles/imChat'
import { selectLocalChat } from '../bundles/localChat'
import { selectNames } from '../bundles/names'
import { selectShouldDisplayNotifications } from '../bundles/notifications'
import { selectActiveTab, changeChatTab } from '../bundles/session'

import ChatBox from '../components/chatBox'

const mapStateToProps = state => {
  return {
    activeTab: selectActiveTab(state),
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
