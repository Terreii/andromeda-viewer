'use strict'

/*
 * Displays all Chats (localchat and IMs)
 *
 * will later also host all Instant Messages
 */

import React from 'react'
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs'

var localChatStore = require('../stores/localChatStore')
var IMStore = require('../stores/IMStore')
var nameStore = require('../stores/nameStore')
var ChatDialog = require('./chatDialog')
import {
  sendLocalChatMessage, sendInstantMessage
} from '../actions/chatMessageActions'

function getChat () {
  return {
    localChat: localChatStore.getMessages(),
    IMs: IMStore.getChat()
  }
}

var ChatBox = React.createClass({
  displayName: 'ChatBox',

  getInitialState: function () {
    return getChat()
  },

  componentDidMount: function () {
    var removeToken = [
      localChatStore.addListener(this._onChange),
      IMStore.addListener(this._onChange),
      nameStore.addListener(this._onChange)
    ]
    this.__removeToken = removeToken
  },

  componentWillUnmount: function () {
    this.__removeToken.forEach(function (token) {
      token.remove()
    })
  },

  _onChange: function () {
    this.setState(getChat())
  },

  render: function () {
    var self = this
    var imsNames = this.state.IMs.keySeq().toJSON()
    var ims = imsNames.map(function (key) {
      var name
      if (nameStore.hasNameOf(key)) {
        name = nameStore.getNameOf(key).getName()
      } else {
        name = key
      }
      return <Tab>
        {name}
      </Tab>
    })
    var panels = imsNames.map(function (key) {
      var messages = self.state.IMs.get(key)
      var id = messages.get(0).get('id')
      return (
        <TabPanel>
          <ChatDialog data={messages} isIM='true' sendTo={function (text) {
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
            <ChatDialog data={this.state.localChat} sendTo={function (text) {
              sendLocalChatMessage(text, 1, 0)
            }} />
          </TabPanel>
          {panels}
        </Tabs>
      </div>
    )
  }
})

module.exports = ChatBox
