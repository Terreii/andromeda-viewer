'use strict'

import Dispatcher from '../network/uiDispatcher'

const toSendTypes = [ // add here Message-Types that will be processed in the UI
  'ChatFromSimulator',
  'ImprovedInstantMessage'
]

// Gets all messages from the SIM and filters them for the UI

export default function simActionFilter (msg) {
  const name = msg.body.name
  if (toSendTypes.includes(name)) {
    let toSendMsg = Object.create(msg.body)
    toSendMsg.type = name
    Dispatcher.dispatch(toSendMsg)
  }
}
