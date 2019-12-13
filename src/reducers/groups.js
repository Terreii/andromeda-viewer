// Groups of the avatar

import { createSlice, createSelector } from '@reduxjs/toolkit'
import { v4 as uuid } from 'uuid'

import { getValueOf, mapBlockOf } from '../network/msgGetters'

const groupSlice = createSlice({
  name: 'groups',

  initialState: getInitialState(),

  reducers: {
    chatSessionStarted: {
      /**
       * Handle starting of group chat session.
       * @param {Group[]} state - All groups
       * @param {import('@reduxjs/toolkit').PayloadAction} action - Chat start action
       */
      reducer (state, action) {
        for (const group of state) {
          if (group.id in action.payload) {
            group.sessionStarted = true
          }
        }
      },
      /**
       * Preparing of group chat session started action.
       * @param {Group[]} groups - Groups the chat is now started.
       * @param {string} avatarDataSaveId - UUID used to save the data of this avatar.
       */
      prepare (groups, avatarDataSaveId) {
        return {
          payload: groups.reduce((obj, group) => {
            obj[group.id] = {
              id: group.id,
              saveId: uuid(),
              name: group.name
            }
            return obj
          }, {}),
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

        return mapBlockOf(action, 'GroupData', getValue => ({
          id: getValue('GroupID'),
          name: getValue('GroupName', true),
          insigniaID: getValue('GroupInsigniaID'),
          title: getValue('GroupTitle', true),
          acceptNotices: getValue('AcceptNotices'),
          powers: getValue('GroupPowers'),
          listInProfile: udpListInProfile
        }))
      } else {
        return state
      }
    },

    EVENT_QUEUE_AgentGroupDataUpdate (state, action) {
      // this is OK, because the max number of groups an user can join is 60.
      for (const groupData of action.body.GroupData) {
        const id = groupData.GroupID

        const index = state.findIndex(group => group.id === id)
        const isNewGroup = index < 0

        const group = isNewGroup
          ? {
            id,
            title: ''
          }
          : state[index]

        group.name = groupData.GroupName
        group.insigniaID = groupData.GroupInsigniaID
        group.acceptNotices = groupData.AcceptNotices
        group.powers = Buffer.from(groupData.GroupPowers)
        group.listInProfile = groupData.ListInProfile

        if (isNewGroup) {
          state.push(group)
        }
      }
    },

    DidLogout: getInitialState,
    UserWasKicked: getInitialState
  }
})

/**
 * Get the initial state.
 * @returns {Group[]} Empty list of groups.
 */
function getInitialState () {
  return []
}

export default groupSlice.reducer

// Actions

export const { chatSessionStarted } = groupSlice.actions

// Selectors

/**
 * Select all groups the user is part of.
 * @param {object} state Reducer State
 * @returns {Group[]} All groups
 */
export const selectGroups = state => state.groups

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

/**
 * A group the avatar belongs to.
 * @typedef {Object} Group
 * @property {string} id - UUID of the group.
 * @property {string} name - Name of the group.
 * @property {string} insigniaID - UUID of the insignia (group picture).
 * @property {string} title - Current title of the avatar.
 * @property {boolean} acceptNotices - Will the avatar receive group notifications.
 * @property {boolean} listInProfile - Is this group listed in the avatar profile.
 * @property {Buffer} powers - 64Uint list of powers the user has. Stored bitwise.
 * @property {boolean} sessionStarted - The group chat session was started.
 */
