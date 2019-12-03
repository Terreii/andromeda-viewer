/*
 * Reduces the names of avatars
 */

import { createReducer } from '@reduxjs/toolkit'

import AvatarName from '../avatarName'
import { mapBlockOf } from '../network/msgGetters'

import { LocalChatSourceType, NotificationTypes } from '../types/chat'

export default createReducer({ names: {}, getDisplayNamesURL: '' }, {
  SeedCapabilitiesLoaded (state, action) {
    state.getDisplayNamesURL = action.capabilities.GetDisplayNames
  },

  CHAT_FROM_SIMULATOR_RECEIVED (state, action) {
    if (!(action.msg.fromId in state.names) &&
      action.msg.sourceType === LocalChatSourceType.Agent
    ) {
      addName(state.names, action.msg.fromId, action.msg.fromName)
    }
  },

  PERSONAL_IM_RECEIVED (state, action) {
    if (!(action.msg.fromId in state.names)) {
      addName(state.names, action.msg.fromId, action.msg.fromName)
    }
  },

  GROUP_IM_RECEIVED (state, action) {
    if (!(action.msg.fromId in state.names)) {
      addName(state.names, action.msg.fromId, action.msg.fromName)
    }
  },

  CONFERENCE_IM_RECEIVED (state, action) {
    if (!(action.msg.fromId in state.names)) {
      addName(state.names, action.msg.fromId, action.msg.fromName)
    }
  },

  didLogin (state, action) {
    state.names[action.uuid] = action.name

    for (const msg of action.localChatHistory) {
      addName(state.names, msg.fromId, msg.fromName)
    }
  },

  UUIDNameReply (state, action) {
    const names = mapBlockOf(action, 'UUIDNameBlock', getValue => {
      return {
        firstName: getValue('FirstName', true),
        lastName: getValue('LastName', true),
        id: getValue('ID')
      }
    })

    for (const name of names) {
      addName(state.names, name.id, name.firstName + ' ' + name.lastName)
    }
  },

  IM_CHAT_INFOS_LOADED (state, action) {
    for (const chat of action.chats) {
      const avatarId = chat.target
      if (chat.chatType !== 'personal' || avatarId in state.names) continue

      state.names[avatarId] = new AvatarName(chat.name)
    }
  },

  IM_HISTORY_LOADING_FINISHED (state, action) {
    for (const msg of action.messages) {
      if (msg.fromId in state.names) continue

      state.names[msg.fromId] = new AvatarName(msg.fromName)
    }
  },

  DisplayNamesStartLoading (state, action) {
    for (const id of action.ids) {
      if (id in state.names) {
        state.names[id] = state.names[id].withIsLoadingSetTo(true)
      }
    }
  },

  DisplayNamesLoaded (state, action) {
    for (const agent of action.agents) {
      const id = agent.id.toString()
      const old = id in state.names ? state.names[id] : new AvatarName(agent.username)

      const next = old.withDisplayNameSetTo(
        agent.display_name,
        agent.legacy_first_name,
        agent.legacy_last_name
      )

      state.names[id] = next
    }
  },

  NOTIFICATION_RECEIVED (state, action) {
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

      addName(state.names, id, name)
    }
  },

  DidLogout () {
    return {
      names: {},
      getDisplayNamesURL: ''
    }
  },

  UserWasKicked () {
    return {
      names: {},
      getDisplayNamesURL: ''
    }
  }
})

// Only adds a Name to names if it is new or did change
function addName (names, uuid, name) {
  const updated = new AvatarName(name)
  if (!(uuid in names) || !names[uuid].compare(updated)) {
    names[uuid] = updated
  }
}
