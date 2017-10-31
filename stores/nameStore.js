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

function namesReducer (state = Immutable.Map(), action) {
  switch (action.type) {
    case 'ChatFromSimulator':
      return addNameFromLocalChat(state, action.msg)
    case 'ImprovedInstantMessage':
      return addNameFromIM(state, action.msg)
    case 'didLogin':
      const selfName = addName(state, action.uuid, action.name)
      return action.localChatHistory.reduce(addNameFromLocalChat, selfName)
    case 'UUIDNameReply':
      return action.msg.reduce(addNameFromUUIDName, state)
    case 'IMChatInfosLoaded':
      return state.merge(action.chats.reduce((all, chat) => {
        all[chat.target] = new AvatarName(chat.name)
        return all
      }, {}))
    default:
      return state
  }
}

export function nameStoreReduce (state = Immutable.Map(), action) {
  switch (action.type) {
    case '@@INIT':
    case 'ChatFromSimulator':
    case 'ImprovedInstantMessage':
    case 'didLogin':
    case 'UUIDNameReply':
    case 'IMChatInfosLoaded':
      return state.set('names', namesReducer(state.get('names'), action))
    case 'SeedCapabilitiesLoaded':
      return state.set('getDisplayNamesURL', action.capabilities.GetDisplayNames)
    default:
      return state
  }
}
