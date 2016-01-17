'use strict'

var Dispatcher = require('../uiDispatcher.js')

var toSendTypes = [ // add here Message-Types that will be processed in the UI
  'ChatFromSimulator',
  'ImprovedInstantMessage'
]

// Gets all messages from the SIM and filters them for the UI

module.exports = function (msg) {
  var msgIsForUI = toSendTypes.some(function (type) {
    return type === msg.body.name
  })
  if (msgIsForUI) {
    var toSendMsg = Object.create(msg.body)
    toSendMsg.actionType = msg.body.name
    Dispatcher.dispatch(toSendMsg)
  }
}
