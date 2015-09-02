'use strict';

/*
 * Sends a message to the server.
 */

var session = require('../session.js');

module.exports = {
  sendLocalChatMessage: function (text, type, channel) {
    // Sends messages from the localchat
    // No UI update, because the server/sim will send it
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
