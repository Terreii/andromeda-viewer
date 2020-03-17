/*
 * Reduces the names of avatars
 */

import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit'

import AvatarName from '../avatarName'
import { mapBlockOf } from '../network/msgGetters'

import {
  received as imReceived,
  infosLoaded as imInfosLoaded,
  historyLoadingFinished as imHistoryLoadingFinished,
  NewChatActionPayload
} from './imChat'
import { received as localChatReceived } from './localChat'
import { receive as notificationReceive } from './notifications'
import {
  selectIsLoggedIn,
  selectAgentId,
  login,
  logout,
  userWasKicked,
  LoginAction
} from './session'

import {
  LocalChatMessage,
  LocalChatSourceType,
  IMChatType,
  InstantMessage,
  NotificationTypes
} from '../types/chat'

const nameSlice = createSlice({
  name: 'names',

  initialState: {
    names: {},
    getDisplayNamesURL: ''
  } as {
    names: { [key: string]: AvatarName }
    getDisplayNamesURL: string
  },

  reducers: {
    displayNamesStartLoading (state, action: PayloadAction<string[]>) {
      for (const id of action.payload) {
        if (id in state.names) {
          state.names[id] = state.names[id].withIsLoadingSetTo(true)
        }
      }
    },

    displayNamesLoaded: {
      reducer (state, action: PayloadAction<DisplayNameResult>) {
        for (const agent of action.payload.agents) {
          const id = agent.id
          const old = id in state.names ? state.names[id] : new AvatarName(agent.username)

          const next = old.withDisplayNameSetTo(
            agent.display_name,
            agent.legacy_first_name,
            agent.legacy_last_name
          )

          state.names[id] = next
        }

        for (const badId of action.payload.badIDs) {
          if (badId in state.names && state.names[badId].isLoadingDisplayName) {
            state.names[badId] = state.names[badId].withIsLoadingSetTo(false)
          } else if (!(badId in state.names)) {
            state.names[badId] = new AvatarName({ first: badId, last: '' })
          }
        }
      },
      prepare: (agents: any, badIDs: string[] | null, badNames: string[] | null) => ({
        payload: {
          agents,
          badIDs: badIDs || [],
          badNames: badNames || []
        }
      })
    }
  },

  extraReducers: {
    [login.type] (state, action: PayloadAction<LoginAction>) {
      state.names[action.payload.uuid] = action.payload.name

      for (const msg of action.payload.localChatHistory) {
        addName(state.names, msg.fromId, msg.fromName)
      }
    },

    SeedCapabilitiesLoaded (state, action) {
      state.getDisplayNamesURL = action.capabilities.GetDisplayNames
    },

    [localChatReceived.type] (state, action: PayloadAction<LocalChatMessage>) {
      if (!(action.payload.fromId in state.names) &&
        action.payload.sourceType === LocalChatSourceType.Agent
      ) {
        addName(state.names, action.payload.fromId, action.payload.fromName)
      }
    },

    [imReceived.type] (
      state,
      action: PayloadAction<{ chatType: IMChatType, session: string, msg: InstantMessage }>
    ) {
      const msg = action.payload.msg
      if (!(action.payload.msg.fromId in state.names)) {
        addName(state.names, msg.fromId, msg.fromName)
      }
    },

    UUIDNameReply (state, action) {
      const names = mapBlockOf(action, 'UUIDNameBlock', (getValue: Function) => {
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

    [imInfosLoaded.type] (state, action: PayloadAction<NewChatActionPayload[]>) {
      for (const chat of action.payload) {
        const avatarId = chat.target
        if (chat.chatType !== IMChatType.personal || avatarId in state.names) continue

        state.names[avatarId] = new AvatarName(chat.name)
      }
    },

    [imHistoryLoadingFinished.type] (
      state,
      action: PayloadAction<{ sessionId: string, messages: InstantMessage[], didLoadAll: boolean }>
    ) {
      for (const msg of action.payload.messages) {
        if (msg.fromId in state.names) continue

        state.names[msg.fromId] = new AvatarName(msg.fromName)
      }
    },

    [notificationReceive.type]: (state, action) => {
      const notification = action.payload
      const type = notification.notificationType

      if ([
        NotificationTypes.FriendshipOffer,
        NotificationTypes.GroupNotice,
        NotificationTypes.LoadURL,
        NotificationTypes.RequestTeleportLure,
        NotificationTypes.TeleportLure,
        NotificationTypes.InventoryOffered
      ].some(notificationType => notificationType === type)) {
        const id = type === NotificationTypes.GroupNotice
          ? notification.senderId
          : notification.fromId

        const name = type === NotificationTypes.GroupNotice
          ? notification.senderName
          : notification.fromName

        addName(state.names, id, name)
      }
    },

    [logout.type] () {
      return {
        names: {},
        getDisplayNamesURL: ''
      }
    },

    [userWasKicked.type] () {
      return {
        names: {},
        getDisplayNamesURL: ''
      }
    }
  }
})

export default nameSlice.reducer

export const {
  displayNamesStartLoading,
  displayNamesLoaded
} = nameSlice.actions

export const selectNames = (state: any): { [key: string]: AvatarName } => state.names.names

export function selectAvatarNameById (state: any, id: string): AvatarName | undefined {
  return selectNames(state)[id]
}

export const selectDisplayNamesURL = (state: any): string => state.names.getDisplayNamesURL

export const selectOwnAvatarName = createSelector(
  [
    selectIsLoggedIn,
    selectAgentId,
    selectNames
  ],
  (isLoggedIn, agentId, names) => isLoggedIn
    ? names[agentId]
    : null
)

// Only adds a Name to names if it is new or did change
function addName (names: { [key: string]: AvatarName }, uuid: string, name: string) {
  const updated = new AvatarName(name)
  if (!(uuid in names) || !names[uuid].compare(updated)) {
    names[uuid] = updated
  }
}

interface DisplayNameResult {
  agents: DisplayNameResultAvatar[],
  badIDs: string[],
  badNames: string[]
}
interface DisplayNameResultAvatar {
  id: string,
  username: string,
  display_name: string,
  display_name_next_update: number,
  legacy_first_name: string,
  legacy_last_name: string,
  is_display_name_default: boolean
}
