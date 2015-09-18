'use strict';

/*
 * Displays all Chats (localchat and IMs)
 *
 * will later also host all Instant Messages
 */

var React = require('react');
var ReactTabs = require('react-tabs');
var Tab = ReactTabs.Tab;
var Tabs = ReactTabs.Tabs;
var TabList = ReactTabs.TabList;
var TabPanel = ReactTabs.TabPanel;

var localChatStore = require('../stores/localChatStore.js');
var IMStore = require('../stores/IMStore.js');
var ChatDialog = require('./chatDialog.jsx');
var chatMessageActions = require('../actions/chatMessageActions.js');

function getChat () {
  return {
    localChat: localChatStore.getMessages()
  };
}

console.log(IMStore);

var ChatBox = React.createClass({
  displayName: 'ChatBox',

  getInitialState: function () {
    return getChat();
  },

  componentDidMount: function () {
    this.__removeToken = localChatStore.addListener(this._onChange);
  },

  componentWillUnmount: function () {
    this.__removeToken.remove();
  },

  _onChange: function () {
    this.setState(getChat());
  },

  render: function () {
    return (
      <div className='ChatBox'>Chats
        <Tabs>
          <TabList>
            <Tab>Local</Tab>
            <Tab>Test</Tab>
          </TabList>
          <TabPanel>
            <ChatDialog data={this.state.localChat} sendTo={function (text) {
              chatMessageActions.sendLocalChatMessage(text, 1, 0);
            }}/>
          </TabPanel>
          <TabPanel>
            <p>Hello World!</p>
          </TabPanel>
        </Tabs>
      </div>
    );
  }
});

module.exports = ChatBox;
