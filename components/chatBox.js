'use strict'

/*
 * Displays all Chats (localchat and IMs)
 *
 * will later also host all Instant Messages
 */

import React from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

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

import 'react-tabs/style/react-tabs.css'

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
    const ims = imsIds.map(id => {
      const withId = this.state.IMs.getIn([id, 'withId'])
      const name = names.has(withId)
        ? names.get(withId).getName()
        : withId
      return <Tab
        key={id}
        className='react-tabs__tab'
        selectedClassName='react-tabs__tab--selected'
        disabledClassName='react-tabs__tab--disabled'
        >
        {name}
      </Tab>
    })
    const panels = imsIds.map(id => {
      const chat = this.state.IMs.get(id)
      const target = chat.get('withId')
      return (
        <TabPanel
          key={id}
          className='react-tabs__tab-panel'
          selectedClassName='react-tabs__tab-panel--selected'
          >
          <ChatDialog
            data={chat}
            isIM
            sendTo={text => sendInstantMessage(text, target, id)}
            names={names}
            loadHistory={chatUUID => State.dispatch(getIMHistory(chatUUID))}
            />
        </TabPanel>
      )
    })

    return (
      <div className='ChatBox'>
        <Tabs>
          <TabList className='react-tabs__tab-list'>
            <Tab
              className='react-tabs__tab'
              selectedClassName='react-tabs__tab--selected'
              disabledClassName='react-tabs__tab--disabled'
              >
              Friends
            </Tab>
            <Tab
              className='react-tabs__tab'
              selectedClassName='react-tabs__tab--selected'
              disabledClassName='react-tabs__tab--disabled'
              >
              Local
            </Tab>
            {ims}
          </TabList>
          <TabPanel
            className='react-tabs__tab-panel'
            selectedClassName='react-tabs__tab-panel--selected'
            >
            <FriendsList
              names={names}
              friends={this.state.friends}
              startNewIMChat={
                (dialog, id, name) => State.dispatch(startNewIMChat(dialog, id, name))
              }
              updateRights={(id, rights) => State.dispatch(updateRights(id, rights))}
              />
          </TabPanel>
          <TabPanel
            className='react-tabs__tab-panel'
            selectedClassName='react-tabs__tab-panel--selected'
            >
            <ChatDialog data={this.state.localChat} names={names} sendTo={text => {
              sendLocalChatMessage(text, 1, 0)
            }} />
          </TabPanel>
          {panels}
        </Tabs>
      </div>
    )
  }
}
ChatBox.displayName = 'ChatBox'
