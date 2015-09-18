'use strict';

/*
 * Stores all IM-Chats and IM-Messanges
 */

var Store = require('flux/utils').Store;
var Immutable = require('immutable');

var Dispatcher = require('../uiDispatcher.js');
var session = require('../session.js');

var chats = Immutable.Map();

function addIMTo (message) {
  var messageBlock = message.MessageBlock.data[0];
  var dialog = messageBlock.Dialog.value;

  if (dialog === 41 || dialog === 42) { // filter start/end typing
    return;
  }
  var msg = Immutable.Map({
    fromId: message.AgentData.data[0].AgentID.value,
    fromGroup: messageBlock.FromGroup.value,
    toAgentID: messageBlock.ToAgentID.value,
    parentEstateID: messageBlock.ParentEstateID.value,
    regionID: messageBlock.RegionID.value,
    position: messageBlock.Position.value,
    offline: messageBlock.Offline.value,
    dialog: dialog,
    id: messageBlock.ID.value,
    timestamp: messageBlock.Timestamp.value,
    fromAgentName: fromCharArrayToString(messageBlock.FromAgentName.value),
    message: fromCharArrayToString(messageBlock.Message.value),
    binaryBucket: messageBlock.BinaryBucket.value
  });
  console.log(msg, msg.toObject());

  // if it is send by this user the conversation will be of the toAgentId
  var conv = (session.getAgentId() === msg.fromId) ? msg.toAgentID : msg.fromId;

  var convStore;
  if (chats.has(conv)) {
    convStore = chats.get(conv).push(msg);
  } else {
    convStore = Immutable.List([msg]);
  }

  chats = chats.set(conv, convStore);
}

var IMStore = new Store(Dispatcher);
IMStore.__onDispatch = function (payload) {
  switch (payload.actionType) {
    case 'serverMSG':
      if (payload.name === 'ImprovedInstantMessage') {
        addIMTo(payload);
      }
      break;
    default:
      break;
  }
};
IMStore.getChat = function () {

};

function fromCharArrayToString (buffer) {
  var str = buffer.toString();
  return str.substring(0, str.length - 1);
}

module.exports = IMStore;
