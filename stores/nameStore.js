'use strict'

/*
 * Stores the names of avatars
 */

import {Store} from 'flux/utils'

import Dispatcher from '../network/uiDispatcher'
import {getAgentId, getAvatarName} from '../session'
import AvatarName from '../avatarName'

let names = {}

setTimeout(function () {
  names[getAgentId()] = getAvatarName()
}, 50)

// Only adds a Name to names if it is new or did change
function addName (uuid, nameString) {
  if (nameString instanceof Uint8Array || nameString instanceof Buffer) {
    nameString = fromCharArrayToString(nameString)
  }
  if (!names[uuid] || !names[uuid].compare(nameString)) {
    names[uuid] = new AvatarName(nameString)
    return true
  } else {
    return false
  }
}

// Adds the names of the sending Avatar/Agent from IMs
function addNameFromIM (msg) {
  if (msg.MessageBlock.data[0].Dialog.value === 9) {
    return
  }
  const id = msg.AgentData.data[0].AgentID.value
  const name = msg.MessageBlock.data[0].FromAgentName.value
  return addName(id, name)
}

// Adds the names of the sending Avatar/Agent from the local Chat
function addNameFromLocalChat (msg) {
  if (msg.SourceType.value === 1) {
    const id = msg.SourceID.value
    const name = msg.FromName.value
    return addName(id, name)
  }
  return false
}

class NameStore extends Store {
  constructor () {
    super(Dispatcher)
  }

  __onDispatch (payload) {
    let didChange = false
    switch (payload.type) {
      case 'ChatFromSimulator':
        didChange = addNameFromLocalChat(payload.ChatData.data[0])
        break
      case 'ImprovedInstantMessage':
        didChange = addNameFromIM(payload)
        break
    }
    if (didChange) {
      this.__emitChange()
    }
  }

  hasNameOf (uuid) {
    return typeof names[uuid] === 'string'
  }

  // Gets the name of an Avatar/Agent
  // id there is no name for that ID it will return an empty string
  getNameOf (uuid) {
    if (names[uuid]) {
      return names[uuid]
    } else {
      return ''
    }
  }

  getNames () {
    let list = []
    for (const uuid in names) {
      if (names.hasOwnProperty(uuid)) {
        list.push(names[uuid].getFullName())
      }
    }
    return list
  }
}

export default new NameStore()

function fromCharArrayToString (buffer) {
  var str = buffer.toString()
  return str.substring(0, str.length - 1)
}
