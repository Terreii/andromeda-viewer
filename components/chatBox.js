'use strict'

/*
 * Displays all Chats (localchat and IMs)
 *
 * will later also host all Instant Messages
 */

import React from 'react'
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs'

import State from '../stores/state'
import nameStore from '../stores/nameStore'
import ChatDialog from './chatDialog'
import {
  sendLocalChatMessage, sendInstantMessage
} from '../actions/chatMessageActions'

export default class ChatBox extends React.Component {
  constructor () {
    super()
    this.state = State.getState()
  }

  componentDidMount () {
    const removeToken = [
      nameStore.addListener(this._onChange.bind(this))
    ]
    this.__removeToken = removeToken
    this.__unsubscribe = State.subscribe(this._onChange.bind(this))
  }

  componentWillUnmount () {
    this.__removeToken.forEach(token => token.remove())
    this.__unsubscribe()
  }

  _onChange () {
    this.setState(State.getState())
  }

  render () {
    const imsNames = this.state.IMs.keySeq().toJSON()
    const ims = imsNames.map(key => {
      const name = nameStore.hasNameOf(key)
        ? nameStore.getNameOf(key).getName()
        : key
      return <Tab key={key}>{name}</Tab>
    })
    const panels = imsNames.map(key => {
      const messages = this.state.IMs.get(key)
      const id = messages.get(0).get('id')
      return (
        <TabPanel key={key}>
          <ChatDialog data={messages} isIM sendTo={text => {
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
