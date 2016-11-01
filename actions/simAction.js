'use strict'

import Dispatcher from '../network/uiDispatcher'

var toSendTypes = [ // add here Message-Types that will be processed in the UI
  'ChatFromSimulator',
  'ImprovedInstantMessage'
]

// Gets all messages from the SIM and filters them for the UI

export default function simActionFilter (msg) {
  const name = msg.body.name
  const msgIsForUI = toSendTypes.some(type => type === name)
  if (msgIsForUI) {
    let toSendMsg = Object.create(msg.body)
    toSendMsg.actionType = msg.body.name
    Dispatcher.dispatch(toSendMsg)
  }
}
