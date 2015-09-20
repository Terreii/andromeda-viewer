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

  var toAgentID = messageBlock.ToAgentID.value;
  var fromId = message.AgentData.data[0].AgentID.value;

  var msg = Immutable.Map({
    fromId: fromId,
    fromGroup: messageBlock.FromGroup.value,
    toAgentID: toAgentID,
    parentEstateID: messageBlock.ParentEstateID.value,
    regionID: messageBlock.RegionID.value,
    position: messageBlock.Position.value,
    offline: messageBlock.Offline.value,
    dialog: dialog,
    id: messageBlock.ID.value,
    timestamp: messageBlock.Timestamp.value,
    fromAgentName: fromCharArrayToString(messageBlock.FromAgentName.value),
    message: fromCharArrayToString(messageBlock.Message.value),
    binaryBucket: messageBlock.BinaryBucket.value,
    time: new Date()
  });

  // if it is send by this user the conversation will be of the toAgentId
  var conv = (session.getAgentId() === fromId) ? toAgentID : fromId;

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
        this.__emitChange();
      }
      break;
    default:
      break;
  }
};
IMStore.getChat = function () {
  return chats;
};

function fromCharArrayToString (buffer) {
  var str = buffer.toString();
  return str.substring(0, str.length - 1);
}

module.exports = IMStore;
