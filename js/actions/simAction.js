'use strict'

var Dispatcher = require('../uiDispatcher')

var toSendTypes = [ // add here Message-Types that will be processed in the UI
  'ChatFromSimulator',
  'UUIDNameReply',
  'ImprovedInstantMessage'
]

// Gets all messages from the SIM and filters them for the UI

module.exports = function (msg) {
  if (toSendTypes.some((type) => type === msg.body.name)) {
    var toSendMsg = Object.create(msg.body)
    toSendMsg.actionType = msg.body.name
    Dispatcher.dispatch(toSendMsg)
  }
}
