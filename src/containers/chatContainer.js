import React from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'

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

function ChatContainer (props) {
  return <>
    <Helmet aria-disabled='false'>
      <title>{props.selfName.getName()}</title>
    </Helmet>
    <ChatBox {...props} />
  </>
}

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

export default connect(mapStateToProps, mapDispatchToProps)(ChatContainer)
