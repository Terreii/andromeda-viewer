/*
 * Displays all Chats (localchat and IMs)
 *
 * will later also host all Instant Messages
 */

import React from 'react'
import Tabs, { TabPane } from 'rc-tabs'
import TabContent from 'rc-tabs/lib/TabContent'
import ScrollableInkTabBar from 'rc-tabs/lib/ScrollableInkTabBar'

import State from '../stores/state'
import ChatDialog from './chatDialog'
import FriendsList from './friendsList'

import {
  sendLocalChatMessage,
  sendInstantMessage,
  startNewIMChat,
  getIMHistory
} from '../actions/chatMessageActions'
import { updateRights } from '../actions/friendsActions'

import 'rc-tabs/assets/index.css'

export default class ChatBox extends React.Component {
  constructor () {
    super()
    this.state = State.getState()
  }

  componentDidMount () {
    this.__unsubscribe = State.subscribe(this._onChange.bind(this))
  }

  componentWillUnmount () {
    this.__unsubscribe()
  }

  _onChange () {
    this.setState(State.getState())
  }

  render () {
    const names = this.state.names.get('names')
    const imsIds = this.state.IMs.keySeq().toJSON()

    const panels = imsIds.map(id => {
      const chat = this.state.IMs.get(id)
      const target = chat.get('withId')
      const name = names.has(target)
        ? names.get(target).getName()
        : target

      return <TabPane tab={name} key={id}>
        <ChatDialog
          data={chat}
          isIM
          sendTo={text => sendInstantMessage(text, target, id)}
          names={names}
          loadHistory={chatUUID => State.dispatch(getIMHistory(chatUUID))}
          />
      </TabPane>
    })

    return <Tabs
      defaultActiveKey='local'
      renderTabBar={() => <ScrollableInkTabBar />}
      renderTabContent={() => <TabContent />}
      >
      <TabPane tab='Friends' key='friends'>
        <FriendsList
          names={names}
          friends={this.state.friends}
          startNewIMChat={
            (dialog, id, name) => State.dispatch(startNewIMChat(dialog, id, name))
          }
          updateRights={(id, rights) => State.dispatch(updateRights(id, rights))}
          />
      </TabPane>

      <TabPane tab='Local' key='local'>
        <ChatDialog
          data={this.state.localChat}
          names={names}
          sendTo={text => {
            sendLocalChatMessage(text, 1, 0)
          }}
          />
      </TabPane>

      {panels}
    </Tabs>
  }
}
ChatBox.displayName = 'ChatBox'
