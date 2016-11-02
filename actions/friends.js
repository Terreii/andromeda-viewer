'use strict'

import Dispatcher from '../network/uiDispatcher'
import {getActiveCircuit} from '../session'

let UUIDNameIds = []
let didRequestIds = {} // Stores the time of the last request for a ID
function sendUUIDNameRequest () {
  if (UUIDNameIds.length === 0) {
    return
  }
  getActiveCircuit().send('UUIDNameRequest', {
    UUIDNameBlock: UUIDNameIds.map((id) => {
      didRequestIds[id] = Date.now()
      return {
        ID: id
      }
    })
  })
  UUIDNameIds = []
}

export function initFriends (friendsList) {
  Dispatcher.dispatch({
    actionType: 'friendsInit',
    friends: friendsList
  })
}

export function getName (id) {
  const timeLimit = Date.now() - 4000
  // If the id is not already in the next request
  if (
    UUIDNameIds.length === 0 ||
    // and wasen't requested in the last 4 seconds
    UUIDNameIds.every((idInRequest) => id !== idInRequest) &&
    (didRequestIds[id] == null || didRequestIds[id] < timeLimit)
  ) {
    UUIDNameIds.push(id)
  }
  setTimeout(sendUUIDNameRequest, 1000)
}
