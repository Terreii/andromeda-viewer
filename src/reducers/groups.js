// Groups of the avatar

import { createReducer } from '@reduxjs/toolkit'

import { getValueOf, mapBlockOf } from '../network/msgGetters'

export default createReducer([], {
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

  GROUP_CHAT_SESSIONS_STARTED (state, action) {
    for (const group of state) {
      if (group.id in action.groups) {
        group.sessionStarted = true
      }
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

  DidLogout: () => [],
  UserWasKicked: () => []
})
