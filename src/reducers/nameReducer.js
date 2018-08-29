/*
 * Reduces the names of avatars
 */

import Immutable from 'immutable'

import AvatarName from '../avatarName'
import { mapBlockOf } from '../network/msgGetters'

// Only adds a Name to names if it is new or did change
function addName (state, uuid, name) {
  const updated = new AvatarName(name)
  if (!state.has(uuid) || !state.get(uuid).compare(updated)) {
    return state.set(uuid, updated)
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

function namesReducer (state = Immutable.Map(), action) {
  switch (action.type) {
    case 'ChatFromSimulator':
      if (state.has(action.msg.sourceID)) return state
      return addNameFromLocalChat(state, action.msg)

    case 'ImprovedInstantMessage':
      if (state.has(action.msg.fromId)) return state
      return addNameFromIM(state, action.msg)

    case 'didLogin':
      const selfName = addName(state, action.uuid, action.name)
      return action.localChatHistory.reduce(addNameFromLocalChat, selfName)

    case 'UUIDNameReply':
      return mapBlockOf(action, 'UUIDNameBlock', getValue => {
        return {
          firstName: getValue('FirstName', true),
          lastName: getValue('LastName', true),
          id: getValue('ID')
        }
      }).reduce((state, { firstName, lastName, id }) => {
        return addName(state, id, firstName + ' ' + lastName)
      }, state)

    case 'IMChatInfosLoaded':
      return state.merge(action.chats.reduce((all, chat) => {
        all[chat.target] = new AvatarName(chat.name)
        return all
      }, {}))

    case 'DisplayNamesStartLoading':
      return action.ids.reduce((names, id) => {
        if (!names.has(id)) return names
        const nextName = names.get(id).withIsLoadingSetTo(true)
        return names.set(id, nextName)
      }, state)

    case 'DisplayNamesLoaded':
      return action.agents.reduce((names, agent) => {
        const id = agent.id.toString()
        const old = names.has(id) ? names.get(id) : new AvatarName(agent.username)
        const next = old.withDisplayNameSetTo(agent.display_name)
        next.first = agent.legacy_first_name
        next.last = agent.legacy_last_name
        return names.set(id, next)
      }, state)

    default:
      return state
  }
}

export default function namesCoreReducer (state = Immutable.Map(), action) {
  switch (action.type) {
    case '@@INIT':
    case 'ChatFromSimulator':
    case 'ImprovedInstantMessage':
    case 'didLogin':
    case 'UUIDNameReply':
    case 'IMChatInfosLoaded':
    case 'DisplayNamesStartLoading':
    case 'DisplayNamesLoaded':
      return state.set('names', namesReducer(state.get('names'), action))

    case 'SeedCapabilitiesLoaded':
      return state.set('getDisplayNamesURL', action.capabilities.GetDisplayNames)

    case 'DidLogout':
    case 'UserWasKicked':
      return Immutable.Map({
        names: namesReducer(undefined, action)
      })

    default:
      return state
  }
}
