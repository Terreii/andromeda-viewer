'use strict';

var session = require('../session.js');

module.exports = {
  sendLocalChatMessage: function (text, type, channel) {
    // Sends messages from the localchat
    session.getActiveCircuit().send('ChatFromViewer', {
      AgentData: [
        {
          AgentID: session.getAgentId(),
          SessionID: session.getSessionId()
        }
      ],
      ChatData: [
        {
          Message: Buffer.concat([new Buffer(text), new Buffer([0])]),
          Type: type,
          Channel: channel
        }
      ]
    });
  }
};
