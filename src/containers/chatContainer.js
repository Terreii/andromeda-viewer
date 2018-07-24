import {connect} from 'react-redux'

import {
  sendLocalChatMessage,
  sendInstantMessage,
  startNewIMChat,
  getIMHistory
} from '../actions/chatMessageActions'
import {updateRights} from '../actions/friendsActions'

import ChatBox from '../components/chatBox'

const mapStateToProps = state => {
  return {
    localChat: state.localChat,
    IMs: state.IMs,
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
