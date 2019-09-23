/*
 * Reduces the names of avatars
 */

import AvatarName from '../avatarName'
import { mapBlockOf } from '../network/msgGetters'

import { LocalChatSourceType, NotificationTypes } from '../types/chat'

// Only adds a Name to names if it is new or did change
function addName (state, uuid, name) {
  const updated = new AvatarName(name)
  if (!(uuid in state) || !state[uuid].compare(updated)) {
    return {
      ...state,
      [uuid]: updated
    }
  } else {
    return state
  }
}

// Adds the names of the sending Avatar/Agent from the local Chat
function addNameFromLocalChat (state, msg) {
  if (msg.sourceType === LocalChatSourceType.Agent) {
    const id = msg.fromId
    const name = msg.fromName
    return addName(state, id, name)
  }
  return state
}

function namesReducer (state = {}, action) {
  switch (action.type) {
    case 'CHAT_FROM_SIMULATOR_RECEIVED':
      return action.msg.fromId in state
        ? state
        : addNameFromLocalChat(state, action.msg)

    case 'PERSONAL_IM_RECEIVED':
    case 'GROUP_IM_RECEIVED':
    case 'CONFERENCE_IM_RECEIVED':
      return action.msg.fromId in state
        ? state
        : addName(state, action.msg.fromId, action.msg.fromName)

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

    case 'IM_CHAT_INFOS_LOADED':
      return {
        ...state,
        ...action.chats.reduce((all, chat) => {
          const avatarId = chat.target
          if (chat.chatType !== 'personal' || avatarId in state) return all

          all[avatarId] = new AvatarName(chat.name)
          return all
        }, {})
      }

    case 'IM_HISTORY_LOADING_FINISHED':
      let didChange = false
      return action.messages.reduce((oldState, msg) => {
        if (msg.fromId in oldState) return oldState

        if (didChange) {
          oldState[msg.fromId] = new AvatarName(msg.fromName)
          return oldState
        }

        didChange = true
        return {
          ...oldState,
          [msg.fromId]: new AvatarName(msg.fromName)
        }
      }, state)

    case 'DisplayNamesStartLoading':
      return action.ids.reduce((names, id) => {
        if (!(id in names)) return names

        names[id] = names[id].withIsLoadingSetTo(true)
        return names
      }, { ...state })

    case 'DisplayNamesLoaded':
      return action.agents.reduce((names, agent) => {
        const id = agent.id.toString()
        const old = id in names ? names[id] : new AvatarName(agent.username)

        const next = old.withDisplayNameSetTo(
          agent.display_name,
          agent.legacy_first_name,
          agent.legacy_last_name
        )

        names[id] = next
        return names
      }, { ...state })

    case 'NOTIFICATION_RECEIVED':
      if ([
        NotificationTypes.FriendshipOffer,
        NotificationTypes.GroupNotice,
        NotificationTypes.LoadURL,
        NotificationTypes.RequestTeleportLure,
        NotificationTypes.TeleportLure,
        NotificationTypes.InventoryOffered
      ].some(type => type === action.msg.notificationType)) {
        const notification = action.msg
        const type = notification.notificationType

        const id = type === NotificationTypes.GroupNotice
          ? notification.senderId
          : notification.fromId

        const name = type === NotificationTypes.GroupNotice
          ? notification.senderName
          : notification.fromName

        return addName(state, id, name)
      } else {
        return state
      }

    default:
      return state
  }
}

export default function namesCoreReducer (state = { names: {}, getDisplayNamesURL: '' }, action) {
  switch (action.type) {
    case '@@INIT':
    case 'CHAT_FROM_SIMULATOR_RECEIVED':
    case 'PERSONAL_IM_RECEIVED':
    case 'GROUP_IM_RECEIVED':
    case 'CONFERENCE_IM_RECEIVED':
    case 'didLogin':
    case 'UUIDNameReply':
    case 'IM_CHAT_INFOS_LOADED':
    case 'IM_HISTORY_LOADING_FINISHED':
    case 'DisplayNamesStartLoading':
    case 'DisplayNamesLoaded':
    case 'NOTIFICATION_RECEIVED':
      const updated = namesReducer(state.names, action)
      if (updated === state.names) return state

      return {
        ...state,
        names: updated
      }

    case 'SeedCapabilitiesLoaded':
      return {
        ...state,
        getDisplayNamesURL: action.capabilities.GetDisplayNames
      }

    case 'DidLogout':
    case 'UserWasKicked':
      return {
        names: namesReducer(undefined, action),
        getDisplayNamesURL: ''
      }

    default:
      return state
  }
}
