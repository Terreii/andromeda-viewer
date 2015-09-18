'use strict';

var Dispatcher = require('../uiDispatcher.js');

var toSendTypes = [ // add here Message-Types that will be processed in the UI
  'ChatFromSimulator',
  'ImprovedInstantMessage'
];

// Gets all messages from the SIM and filters them for the UI

module.exports = function (msg) {
  if (toSendTypes.some(function (type) {
    return type === msg.body.name;
  })) {
    var toSendMsg = msg.body;
    toSendMsg.actionType = 'serverMSG';
    Dispatcher.dispatch(toSendMsg);
  }
};
