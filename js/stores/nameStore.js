'use strict';

/*
 * Stores the names of avatars
 */

var Store = require('flux/utils').Store;

var Dispatcher = require('../uiDispatcher.js');
var session = require('../session.js');

var names = {};

setTimeout(function () {
  names[session.getAgentId()] = session.getAvatarName().getFullName();
}, 50);

// Adds the names of the sending Avatar/Agent from IMs
function addNameFromIM (msg) {
  if (msg.MessageBlock.data[0].Dialog.value === 9) {
    return;
  }
  var id = msg.AgentData.data[0].AgentID.value;
  var name = msg.MessageBlock.data[0].FromAgentName.value.toString('utf8');
  if (name[id] !== name) {
    names[id] = name;
    return true;
  }
  return false;
}

// Adds the names of the sending Avatar/Agent from the local Chat
function addNameFromLocalChat (msg) {
  if (msg.SourceType.value === 1) {
    var id = msg.SourceID.value;
    var name = msg.FromName.value.toString('utf8');
    if (names[id] !== name) {
      names[id] = name;
      return true;
    }
  }
  return false;
}

var nameStore = new Store(Dispatcher);
nameStore.__onDispatch = function (payload) {
  var didChange = false;
  switch (payload.actionType) {
    case 'ChatFromSimulator':
      didChange = addNameFromLocalChat(payload.ChatData.data[0]);
      break;
    case 'ImprovedInstantMessage':
      didChange = addNameFromIM(payload);
      break;
  }
  if (didChange) {
    this.__emitChange();
  }
};
nameStore.hasNameOf = function (uuid) {
  return typeof names[uuid] === 'string';
};
// Gets the name of an Avatar/Agent
// id there is no name for that ID it will return an empty string
nameStore.getNameOf = function (uuid) {
  if (names[uuid]) {
    return names[uuid];
  } else {
    return '';
  }
};

module.exports = nameStore;
