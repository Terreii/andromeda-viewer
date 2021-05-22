/*
 * Reduces the names of avatars
 */

import {
  createSlice,
  createSelector,
  createEntityAdapter,
  PayloadAction,
  Update
} from '@reduxjs/toolkit'
import { NIL } from 'uuid'

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

import { RootState } from '../store/configureStore'
import {
  LocalChatMessage,
  LocalChatSourceType,
  IMChatType,
  InstantMessage,
  NotificationTypes
} from '../types/chat'

export interface AvatarName {
  id: string,
  firstName: string,
  lastName: string,
  displayName: string,
  isDisplayNameDefault: boolean,
  didLoadDisplayName: boolean,
  isLoadingDisplayName: boolean
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

interface DisplayNameResult {
  agents: DisplayNameResultAvatar[],
  badIDs: string[],
  badNames: string[]
}

const namesAdapter = createEntityAdapter<AvatarName>()

const nameSlice = createSlice({
  name: 'names',

  initialState: (() => ({
    names: namesAdapter.getInitialState(),
    getDisplayNamesURL: ''
  }))(),

  reducers: {
    addMissing (state, action: PayloadAction<{ id: string, fallback?: string }>) {
      if (!(action.payload.id in state.names) && action.payload.id !== NIL) {
        let first = ''
        let last = ''
        if (typeof action.payload.fallback === 'string' && action.payload.fallback.length > 0) {
          const names = parseNameString(action.payload.fallback)
          first = names.firstName
          last = names.lastName
        }
        namesAdapter.addOne(state.names, {
          id: action.payload.id,
          firstName: first,
          lastName: last,
          displayName: '',
          isDisplayNameDefault: false,
          didLoadDisplayName: false,
          isLoadingDisplayName: false
        })
      }
    },

    displayNamesStartLoading (state, action: PayloadAction<string[]>) {
      const changes = { isLoadingDisplayName: true }
      namesAdapter.updateMany(state.names, action.payload.map(id => ({
        id,
        changes
      })))
    },

    displayNamesLoaded: {
      reducer (state, action: PayloadAction<DisplayNameResult>) {
        const changes: Update<AvatarName>[] = []

        for (const badId of action.payload.badIDs) {
          changes.push({
            id: badId,
            changes: {
              isLoadingDisplayName: false,
              didLoadDisplayName: true
            }
          })
        }

        for (const agent of action.payload.agents) {
          changes.push({
            id: agent.id,
            changes: {
              displayName: agent.display_name,
              firstName: cleanName(agent.legacy_first_name),
              lastName: cleanName(agent.legacy_last_name),
              isLoadingDisplayName: false,
              didLoadDisplayName: true,
              isDisplayNameDefault: agent.is_display_name_default || agent.display_name.length > 0
            }
          })
        }

        namesAdapter.updateMany(state.names, changes)
      },
      prepare: (
        agents: DisplayNameResultAvatar[],
        badIDs: string[] | null,
        badNames: string[] | null
      ) => ({
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
      namesAdapter.addOne(state.names, {
        id: action.payload.uuid,
        firstName: action.payload.name.first,
        lastName: action.payload.name.last,
        displayName: '',
        isDisplayNameDefault: false,
        didLoadDisplayName: false,
        isLoadingDisplayName: false
      })

      const localChatNames: AvatarName[] = action.payload.localChatHistory
        .filter(msg => String(msg.sourceType) === 'agent' && msg.fromId !== NIL)
        .map(msg => {
          const { firstName, lastName } = parseNameString(msg.fromName)
          return {
            id: msg.fromId,
            firstName,
            lastName,
            displayName: '',
            isDisplayNameDefault: false,
            didLoadDisplayName: false,
            isLoadingDisplayName: false
          }
        })

      namesAdapter.addMany(state.names, localChatNames)
    },

    SeedCapabilitiesLoaded (state, action) {
      state.getDisplayNamesURL = action.capabilities.GetDisplayNames
    },

    [localChatReceived.type] (state, action: PayloadAction<LocalChatMessage>) {
      if (
        !(action.payload.fromId in state.names.entities) &&
        action.payload.sourceType === LocalChatSourceType.Agent &&
        action.payload.fromId !== NIL
      ) {
        const { firstName, lastName } = parseNameString(action.payload.fromName)
        namesAdapter.addOne(state.names, {
          id: action.payload.fromId,
          firstName,
          lastName,
          displayName: '',
          isDisplayNameDefault: false,
          didLoadDisplayName: false,
          isLoadingDisplayName: false
        })
      }
    },

    [imReceived.type] (
      state,
      action: PayloadAction<{ chatType: IMChatType, session: string, msg: InstantMessage }>
    ) {
      const msg = action.payload.msg
      if (!(msg.fromId in state.names.entities) && msg.fromId !== NIL) {
        const { firstName, lastName } = parseNameString(msg.fromName)
        namesAdapter.addOne(state.names, {
          id: msg.fromId,
          firstName,
          lastName,
          displayName: '',
          isDisplayNameDefault: false,
          didLoadDisplayName: false,
          isLoadingDisplayName: false
        })
      }
    },

    UUIDNameReply (state, action) {
      namesAdapter.updateMany(
        state.names,
        mapBlockOf(action, 'UUIDNameBlock', (getValue: Function): Update<AvatarName> => ({
          id: getValue('ID'),
          changes: {
            firstName: getValue('FirstName', true),
            lastName: getValue('LastName', true)
          }
        }))
      )
    },

    [imInfosLoaded.type] (state, action: PayloadAction<NewChatActionPayload[]>) {
      const names: AvatarName[] = action.payload
        .filter(
          chat => chat.chatType === IMChatType.personal || !(chat.target in state.names.entities)
        )
        .map(chat => {
          const { firstName, lastName } = parseNameString(chat.name)
          return {
            id: chat.target,
            firstName,
            lastName,
            displayName: '',
            isDisplayNameDefault: false,
            didLoadDisplayName: false,
            isLoadingDisplayName: false
          }
        })

      namesAdapter.addMany(state.names, names)
    },

    [imHistoryLoadingFinished.type] (
      state,
      action: PayloadAction<{ sessionId: string, messages: InstantMessage[], didLoadAll: boolean }>
    ) {
      const names: AvatarName[] = action.payload.messages
        .filter(msg => !(msg.fromId in state.names.entities || msg.fromId === NIL))
        .map(msg => {
          const { firstName, lastName } = parseNameString(msg.fromName)
          return {
            id: msg.fromId,
            firstName,
            lastName,
            displayName: '',
            isDisplayNameDefault: false,
            didLoadDisplayName: false,
            isLoadingDisplayName: false
          }
        })

      namesAdapter.addMany(state.names, names)
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

        if (!(id in state.names.entities)) {
          const { firstName, lastName } = parseNameString(name)
          namesAdapter.addOne(state.names, {
            id,
            firstName,
            lastName,
            displayName: '',
            isDisplayNameDefault: false,
            didLoadDisplayName: false,
            isLoadingDisplayName: false
          })
        }
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
  addMissing,
  displayNamesStartLoading,
  displayNamesLoaded
} = nameSlice.actions

const selectors = namesAdapter.getSelectors((state: RootState) => state.names.names)

export const selectNames = selectors.selectEntities

export const selectAvatarNameById = selectors.selectById

export const selectAvatarDisplayName = (state: RootState, id: string): string => {
  const name = selectAvatarNameById(state, id)
  if (!name) {
    return id
  }

  return getDisplayName(name)
}

export function selectDisplayNamesURL (state: RootState): string {
  return state.names.getDisplayNamesURL
}

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

// Helpers

function cleanName (name: string) {
  // deletes characters that will be in names but shouldn't
  const trimmed = name.trim().replace(/["\0]/gi, '')
  const upperCased = trimmed.charAt(0).toUpperCase() + // name -> Name
    trimmed.substring(1).toLowerCase()
  return upperCased
}

export function parseNameString (name: string, last?: string): {
  firstName: string,
  lastName: string
} {
  if (typeof last === 'string') {
    return {
      firstName: cleanName(name),
      lastName: cleanName(last)
    }
  }
  const separator = name.match(/[.\s]/) // either a dot or a space
  if (separator) {
    const parts = name.split(separator[0])
    return {
      firstName: cleanName(parts[0]),
      lastName: cleanName(parts[1])
    }
  } else {
    return {
      firstName: cleanName(name),
      lastName: 'Resident'
    }
  }
}

export function getNameString (name: AvatarName): string {
  if (
    name.lastName.length === 0 ||
    name.lastName === 'Resident' ||
    name.lastName.toLowerCase() === 'resident'
  ) {
    return name.firstName || name.id
  }
  return `${name.firstName} ${name.lastName}`
}

export function getFullNameString (name: AvatarName): string {
  return name.firstName + ' ' + name.lastName
}

export function getDisplayName (name: AvatarName): string {
  if (!name.firstName && !name.lastName) {
    return name.id
  }

  const nameString = getNameString(name)
  if (name.isDisplayNameDefault && name.displayName.length > 0) {
    return `${name.displayName} (${nameString})`
  }
  return nameString
}
