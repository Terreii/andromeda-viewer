'use strict'

import Dispatcher from '../network/uiDispatcher'

var UUIDNameIds = []
var didRequestIds = {} // Stores the time of the last request for a ID
function sendUUIDNameRequest () {
  if (UUIDNameIds.length === 0) {
    return
  }
  require('../session').getActiveCircuit().send('UUIDNameRequest', {
    UUIDNameBlock: UUIDNameIds.map((id) => {
      didRequestIds[id] = Date.now()
      return {
        ID: id
      }
    })
  })
  UUIDNameIds = []
}

module.exports = {
  initFriends: (friendsList) => {
    Dispatcher.dispatch({
      actionType: 'friendsInit',
      friends: friendsList
    })
  },
  getName: (id) => {
    const timeLimit = Date.now() - 4000
    // If the id is not already in the next request
    if (UUIDNameIds.length === 0 || UUIDNameIds.every((idInRequest) => {
      return id !== idInRequest
    // and wasen't requested in the last 4 seconds
    }) && (didRequestIds[id] == null || didRequestIds[id] < timeLimit)) {
      UUIDNameIds.push(id)
    }
    setTimeout(sendUUIDNameRequest, 1000)
  }
}
