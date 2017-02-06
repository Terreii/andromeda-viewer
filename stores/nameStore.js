'use strict'

/*
 * Stores the names of avatars
 */

import {ReduceStore} from 'flux/utils'
import Immutable from 'immutable'

import Dispatcher from '../network/uiDispatcher'
import AvatarName from '../avatarName'

// Only adds a Name to names if it is new or did change
function addName (state, uuid, nameString) {
  if (nameString instanceof Uint8Array || nameString instanceof Buffer) {
    nameString = fromCharArrayToString(nameString)
  }
  if (!state.has(uuid) || !state.get(uuid).compare(nameString)) {
    return state.set(uuid, new AvatarName(nameString))
  } else {
    return state
  }
}

// Adds the names of the sending Avatar/Agent from IMs
function addNameFromIM (state, msg) {
  if (msg.MessageBlock.data[0].Dialog.value === 9) {
    return
  }
  const id = msg.AgentData.data[0].AgentID.value
  const name = msg.MessageBlock.data[0].FromAgentName.value
  return addName(state, id, name)
}

// Adds the names of the sending Avatar/Agent from the local Chat
function addNameFromLocalChat (state, msg) {
  if (msg.SourceType.value === 1) {
    const id = msg.SourceID.value
    const name = msg.FromName.value
    return addName(state, id, name)
  }
  return state
}

class NameStore extends ReduceStore {
  getInitialState () {
    return Immutable.Map()
  }

  reduce (state, action) {
    switch (action.type) {
      case 'ChatFromSimulator':
        return addNameFromLocalChat(state, action.ChatData.data[0])
      case 'ImprovedInstantMessage':
        return addNameFromIM(state, action)
      case 'selfNameUpdate':
        return addName(state, action.uuid, action.name.getFullName())
      default:
        return state
    }
  }

  hasNameOf (uuid) {
    return this.getState().has(uuid)
  }

  // Gets the name of an Avatar/Agent
  // id there is no name for that ID it will return an empty string
  getNameOf (uuid) {
    const names = this.getState()
    if (names.has(uuid)) {
      return names.get(uuid)
    } else {
      return ''
    }
  }

  getNames () {
    return this.getState().valueSeq().map(name => name.getFullName()).toJS()
  }
}

export default new NameStore(Dispatcher)

function fromCharArrayToString (buffer) {
  var str = buffer.toString()
  return str.substring(0, str.length - 1)
}
