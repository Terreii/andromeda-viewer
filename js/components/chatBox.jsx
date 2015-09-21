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
var nameStore = require('../stores/nameStore.js');
var ChatDialog = require('./chatDialog.jsx');
var chatMessageActions = require('../actions/chatMessageActions.js');

function getChat () {
  return {
    localChat: localChatStore.getMessages(),
    IMs: IMStore.getChat()
  };
}

var ChatBox = React.createClass({
  displayName: 'ChatBox',

  getInitialState: function () {
    return getChat();
  },

  componentDidMount: function () {
    var removeToken = [
      localChatStore.addListener(this._onChange),
      IMStore.addListener(this._onChange),
      nameStore.addListener(this._onChange)
    ];
    this.__removeToken = removeToken;
  },

  componentWillUnmount: function () {
    this.__removeToken.forEach(function (token) {
      token.remove();
    });
  },

  _onChange: function () {
    this.setState(getChat());
  },

  render: function () {
    var self = this;
    var imsNames = this.state.IMs.keySeq().toJSON();
    var ims = imsNames.map(function (key) {
      var name;
      if (nameStore.hasNameOf(key)) {
        name = nameStore.getNameOf(key).getName();
      } else {
        name = key;
      }
      return <Tab>{name}</Tab>;
    });
    var panels = imsNames.map(function (key) {
      var messages = self.state.IMs.get(key);
      var id = messages.get(0).get('id');
      return (
        <TabPanel>
          <ChatDialog data={messages} isIM='true' sendTo={ function (text) {
            chatMessageActions.sendInstantMessage(text, key, id);
          } } />
        </TabPanel>
      );
    });

    return (
      <div className='ChatBox'>
        <Tabs>
          <TabList>
            <Tab>Local</Tab>
            {ims}
          </TabList>
          <TabPanel>
            <ChatDialog data={this.state.localChat} sendTo={ function (text) {
              chatMessageActions.sendLocalChatMessage(text, 1, 0);
            } }/>
          </TabPanel>
          {panels}
        </Tabs>
      </div>
    );
  }
});

module.exports = ChatBox;
