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
import {
  sendLocalChatMessage, sendInstantMessage
} from '../actions/chatMessageActions'

import tabsStyle from 'react-tabs/style/react-tabs.css'

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
    const imsNames = this.state.IMs.keySeq().toJSON()
    const ims = imsNames.map(key => {
      const name = this.state.names.has(key)
        ? this.state.names.get(key).getName()
        : key
      return <Tab
        key={key}
        className={tabsStyle['react-tabs__tab']}
        selectedClassName={tabsStyle['react-tabs__tab--selected']}
        disabledClassName={tabsStyle['react-tabs__tab--disabled']}
        >
        {name}
      </Tab>
    })
    const panels = imsNames.map(key => {
      const messages = this.state.IMs.get(key)
      const id = messages.get(0).get('id')
      return (
        <TabPanel
          key={key}
          className={tabsStyle['react-tabs__tab-panel']}
          selectedClassName={tabsStyle['react-tabs__tab-panel--selected']}
          >
          <ChatDialog data={messages} isIM sendTo={text => {
            sendInstantMessage(text, key, id)
          }} names={this.state.names} />
        </TabPanel>
      )
    })

    return (
      <div className='ChatBox'>
        <Tabs>
          <TabList className={tabsStyle['react-tabs__tab-list']}>
            <Tab
              className={tabsStyle['react-tabs__tab']}
              selectedClassName={tabsStyle['react-tabs__tab--selected']}
              disabledClassName={tabsStyle['react-tabs__tab--disabled']}
              >
              Local
            </Tab>
            {ims}
          </TabList>
          <TabPanel
            className={tabsStyle['react-tabs__tab-panel']}
            selectedClassName={tabsStyle['react-tabs__tab-panel--selected']}
            >
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
