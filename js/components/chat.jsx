'use strict';

/*
 * Chat View
 *
 * will later also host all Instant Messages
 */

var React = require('react');
var localChatStore = require('../stores/localChatStore.js');

function getChat () {
  return {
    messages: localChatStore.getMessages()
  };
}

var Chat = React.createClass({
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
    var messages = this.state.messages.map(function (msg, i, all) {
      return (
        <li>
          <div>{msg.fromName}</div>
          <div>{msg.message}</div>
        </li>
      );
    });
    return (
      <div>Chats
        <ul>
          {messages}
        </ul>
      </div>
    );
  }
});

module.exports = Chat;
