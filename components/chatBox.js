'use strict'

/*
 * Displays all Chats (localchat and IMs)
 *
 * will later also host all Instant Messages
 */

import React from 'react'
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs'

import State from '../stores/state'
import ChatDialog from './chatDialog'
import FriendsList from './friendsList'
import {
  sendLocalChatMessage, sendInstantMessage
} from '../actions/chatMessageActions'

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
    const namesState = this.state.names
    const imsNames = this.state.IMs.keySeq().toJSON()
    const ims = imsNames.map(key => {
      const name = this.state.names.has(key)
        ? this.state.names.get(key).getName()
        : key
      return <Tab key={key}>{name}</Tab>
    })
    const panels = imsNames.map(key => {
      const messages = this.state.IMs.get(key)
      const id = messages.get(0).get('id')
      return (
        <TabPanel key={key}>
          <ChatDialog data={messages} isIM names={namesState} sendTo={text => {
            sendInstantMessage(text, key, id)
          }} />
        </TabPanel>
      )
    })

    return (
      <div className='ChatBox'>
        <Tabs>
          <TabList>
            <Tab>Friends</Tab>
            <Tab>Local</Tab>
            {ims}
          </TabList>
          <TabPanel>
            <FriendsList names={namesState} friends={this.state.friends} />
          </TabPanel>
          <TabPanel>
            <ChatDialog data={this.state.localChat} sendTo={text => {
              sendLocalChatMessage(text, 1, 0)
            }} names={this.state.names} />
          </TabPanel>
          {panels}
        </Tabs>
      </div>
    )
  }
}
ChatBox.displayName = 'ChatBox'
