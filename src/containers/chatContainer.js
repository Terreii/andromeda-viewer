import { connect } from 'react-redux'

import {
  sendLocalChatMessage,
  sendInstantMessage,
  startNewIMChat,
  getIMHistory
} from '../actions/chatMessageActions'
import { updateRights } from '../actions/friendsActions'

import { getLocalChat, getIMChats } from '../selectors/chat'

import ChatBox from '../components/chatBox'

const mapStateToProps = state => {
  return {
    selfName: state.account.get('avatarName'),
    localChat: getLocalChat(state),
    IMs: getIMChats(state),
    groups: state.groups,
    names: state.names,
    friends: state.friends
  }
}

const mapDispatchToProps = {
  sendLocalChatMessage: text => sendLocalChatMessage(text, 1, 0),
  sendInstantMessage,
  startNewIMChat,
  getIMHistory,
  updateRights
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatBox)
