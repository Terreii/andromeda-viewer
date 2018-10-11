import { connect } from 'react-redux'

import {
  sendLocalChatMessage,
  sendInstantMessage,
  startNewIMChat,
  getIMHistory
} from '../actions/chatMessageActions'
import { updateRights } from '../actions/friendsActions'

import { getLocalChat, getActiveIMChats } from '../selectors/chat'
import { getNames } from '../selectors/names'

import ChatBox from '../components/chatBox'

const mapStateToProps = state => {
  return {
    selfName: state.account.get('avatarName'),
    localChat: getLocalChat(state),
    IMs: getActiveIMChats(state),
    groups: state.groups,
    names: getNames(state),
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
