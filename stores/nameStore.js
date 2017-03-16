'use strict'

/*
 * Stores the names of avatars
 */

import Immutable from 'immutable'

import AvatarName from '../avatarName'

// Only adds a Name to names if it is new or did change
function addName (state, uuid, name) {
  if (!state.has(uuid) || !state.get(uuid).compare(name)) {
    return state.set(uuid, new AvatarName(name))
  } else {
    return state
  }
}

// Adds the names of the sending Avatar/Agent from IMs
function addNameFromIM (state, msg) {
  if (msg.dialog === 9) {
    return state
  }
  const id = msg.fromId
  const name = msg.fromAgentName
  return addName(state, id, name)
}

// Adds the names of the sending Avatar/Agent from the local Chat
function addNameFromLocalChat (state, msg) {
  if (msg.sourceType === 1) {
    const id = msg.sourceID
    const name = msg.fromName
    return addName(state, id, name)
  }
  return state
}

function addNameFromUUIDName (state, {firstName, lastName, id}) {
  return addName(state, id, firstName + ' ' + lastName)
}

export function nameStoreReduce (state = Immutable.Map(), action) {
  switch (action.type) {
    case 'ChatFromSimulator':
      return addNameFromLocalChat(state, action.msg)
    case 'ImprovedInstantMessage':
      return addNameFromIM(state, action.msg)
    case 'selfNameUpdate':
      return addName(state, action.uuid, action.name.getFullName())
    case 'UUIDNameReply':
      return action.msg.reduce(addNameFromUUIDName, state)
    default:
      return state
  }
}

export function hasNameOf (state, uuid) {
  return state.getState().has(uuid)
}

// Gets the name of an Avatar/Agent
// id there is no name for that ID it will return an empty string
export function getNameOf (state, uuid) {
  const names = state.getState()
  if (names.has(uuid)) {
    return names.get(uuid)
  } else {
    return ''
  }
}

export function getNames (state) {
  return state.getState().valueSeq().map(name => name.getFullName()).toJS()
}
