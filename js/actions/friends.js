'use strict'

const Dispatcher = require('../uiDispatcher')

var UUIDNameIds = []
function sendUUIDNameRequest () {
  if (UUIDNameIds.length === 0) {
    return
  }
  require('../session').getActiveCircuit().send('UUIDNameRequest', {
    UUIDNameBlock: UUIDNameIds.map((id) => {
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
    // If the id is not already in the next request
    if (UUIDNameIds.length === 0 || UUIDNameIds.every((idInRequest) => {
      return id !== idInRequest
    })) {
      UUIDNameIds.push(id)
    }
    setTimeout(sendUUIDNameRequest, 1000)
  }
}
