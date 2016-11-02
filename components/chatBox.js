'use strict'

/*
 * Displays all Chats (localchat and IMs)
 *
 * will later also host all Instant Messages
 */

import React from 'react'
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs'

import localChatStore from '../stores/localChatStore'
import IMStore from '../stores/IMStore'
import nameStore from '../stores/nameStore'
import ChatDialog from './chatDialog'
import {
  sendLocalChatMessage, sendInstantMessage
} from '../actions/chatMessageActions'

function getChat () {
  return {
    localChat: localChatStore.getMessages(),
    IMs: IMStore.getChat()
  }
}

export default class ChatBox extends React.Component {
  constructor () {
    super()
    this.state = getChat()
    localChatStore.init()
  }

  componentDidMount () {
    const removeToken = [
      localChatStore.addListener(this._onChange.bind(this)),
      IMStore.addListener(this._onChange.bind(this)),
      nameStore.addListener(this._onChange.bind(this))
    ]
    this.__removeToken = removeToken
  }

  componentWillUnmount () {
    this.__removeToken.forEach(token => token.remove())
  }

  _onChange () {
    this.setState(getChat())
  }

  render () {
    const imsNames = this.state.IMs.keySeq().toJSON()
    const ims = imsNames.map(key => {
      const name = nameStore.hasNameOf(key)
        ? nameStore.getNameOf(key).getName()
        : key
      return <Tab>{name}</Tab>
    })
    const panels = imsNames.map(key => {
      const messages = this.state.IMs.get(key)
      const id = messages.get(0).get('id')
      return (
        <TabPanel>
          <ChatDialog data={messages} isIM='true' sendTo={text => {
            sendInstantMessage(text, key, id)
          }} />
        </TabPanel>
      )
    })

    return (
      <div className='ChatBox'>
        <Tabs>
          <TabList>
            <Tab>
              Local
            </Tab>
            {ims}
          </TabList>
          <TabPanel>
            <ChatDialog data={this.state.localChat} sendTo={text => {
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
