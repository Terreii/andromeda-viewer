// Groups of the avatar

import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuid } from 'uuid'

import { logout, userWasKicked } from './session'

import { getValueOf, mapBlockOf } from '../network/msgGetters'

const groupSlice = createSlice({
  name: 'groups',

  initialState: getInitialState(),

  reducers: {
    chatSessionStarted: {
      reducer (
        state,
        action: PayloadAction<
          { [key: string]: { id: string, saveId: string, name: string } },
          string,
          { avatarDataSaveId: string }
        >
      ) {
        for (const group of state) {
          if (group.id in action.payload) {
            group.sessionStarted = true
          }
        }
      },
      prepare (groups: Group[], avatarDataSaveId: string) {
        return {
          payload: groups.reduce((obj, group) => {
            obj[group.id] = {
              id: group.id,
              saveId: uuid(),
              name: group.name
            }
            return obj
          }, {} as { [key: string]: { id: string, saveId: string, name: string } }),
          meta: { avatarDataSaveId }
        }
      }
    }
  },

  extraReducers: {
    UDPAvatarGroupsReply (state, action) {
      if (
        getValueOf(action, 'AgentData', 0, 'AgentID') ===
        getValueOf(action, 'AgentData', 0, 'AvatarID')
      ) {
        const udpListInProfile = getValueOf(action, 'NewGroupData', 'ListInProfile')

        return mapBlockOf(
          action,
          'GroupData',
          (getValue: (key: string, isString: boolean) => any) => ({
            id: getValue('GroupID', false),
            name: getValue('GroupName', true),
            insigniaID: getValue('GroupInsigniaID', false),
            title: getValue('GroupTitle', true),
            acceptNotices: getValue('AcceptNotices', false),
            powers: getValue('GroupPowers', false),
            listInProfile: udpListInProfile
          })
        )
      } else {
        return state
      }
    },

    'eventQueue/AgentGroupDataUpdate' (state, action: PayloadAction<any>) {
      // this is OK, because the max number of groups an user can join is 60.
      for (const groupData of action.payload.GroupData) {
        const id = groupData.GroupID as string
        const index = state.findIndex(group => group.id === id)

        if (index < 0) {
          state.push({
            id,
            title: '',
            name: groupData.GroupName as string,
            insigniaID: groupData.GroupInsigniaID as string,
            acceptNotices: groupData.AcceptNotices as boolean,
            powers: Buffer.from(groupData.GroupPowers),
            listInProfile: groupData.ListInProfile as boolean,
            sessionStarted: false
          })
        } else {
          const group = state[index]

          group.name = groupData.GroupName as string
          group.insigniaID = groupData.GroupInsigniaID as string
          group.acceptNotices = groupData.AcceptNotices as boolean
          group.powers = Buffer.from(groupData.GroupPowers)
          group.listInProfile = groupData.ListInProfile as boolean
        }
      }
    },

    [logout.type]: getInitialState,
    [userWasKicked.type]: getInitialState
  }
})

/**
 * Get the initial state.
 * @returns {Group[]} Empty list of groups.
 */
function getInitialState (): Group[] {
  return []
}

export default groupSlice.reducer

// Actions

export const { chatSessionStarted } = groupSlice.actions

// Selectors

/**
 * Select all groups the user is part of.
 * @param {object} state Reducer State
 */
export const selectGroups = (state: any): Group[] => state.groups

export const selectGroupsIDs = createSelector(
  [
    selectGroups
  ],
  groups => groups.map(group => group.id)
)

export const selectGroupsWithNoActiveChat = createSelector(
  [
    selectGroups
  ],
  groups => groups.filter(group => !group.sessionStarted)
)

// Types

interface Group {
  /**
  * UUID of the group.
  */
  id: string
  /**
  * Name of the group.
  */
  name: string
  /**
  * UUID of the insignia (group picture).
  */
  insigniaID: string
  /**
  * Current title of the avatar.
  */
  title: string
  /**
  * Will the avatar receive group notifications.
  */
  acceptNotices: boolean
  /**
  * Is this group listed in the avatar profile.
  */
  listInProfile: boolean
  /**
  * 64Uint list of powers the user has. Stored bitwise.
  */
  powers: Buffer
  /**
  * The group chat session was started.
  */
  sessionStarted: boolean
}
