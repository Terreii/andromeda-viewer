'use strict';

/*
 * Stores all LocalChat-Messanges
 */

var Dispatcher = require('../uiDispatcher.js');
var Store = require('flux/utils').Store;

var chat = [];

var sourceTypes = [
  'system',
  'agent',
  'object'
];

var chatTypes = [
  'whisper',
  'normal',
  'shout',
  'say',
  'startTyping',
  'stopTyping',
  'debug',
  'ownerSay'
];

// Add the messanges from the server/sim
function addToChatFromServer (chatData) {
  var sourceT = sourceTypes[Number(chatData.SourceType.value) || 0];
  var chatT = chatTypes[Number(chatData.ChatType.value) || 0];
  var msg = {
    fromName: chatData.FromName.value.toString('utf8'),
    sourceID: chatData.SourceID.value,
    ownerID: chatData.OwnerID.value,
    sourceType: sourceT,
    chatType: chatT,
    audible: chatData.Audible.value,
    position: chatData.Position.value,
    message: chatData.Message.value.toString('utf8'),
    time: new Date()
  };
  chat.push(msg);
}

var localChatStore = new Store(Dispatcher);
localChatStore.__onDispatch = function (payload) {
  switch (payload.actionType) {
    case 'serverMSG':
      if (payload.name === 'ChatFromSimulator') {
        addToChatFromServer(payload.ChatData.data[0]);
        this.__emitChange();
      }
  }
};
localChatStore.getMessages = function () {
  return chat;
};

module.exports = localChatStore;
