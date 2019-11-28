// Groups of the avatar

import { getValueOf, mapBlockOf } from '../network/msgGetters'

export default function groupsReducer (state = [], action) {
  switch (action.type) {
    case 'UDPAvatarGroupsReply':
      if (
        getValueOf(action, 'AgentData', 0, 'AgentID') !==
        getValueOf(action, 'AgentData', 0, 'AvatarID')
      ) {
        return state
      }
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

    case 'GROUP_CHAT_SESSIONS_STARTED':
      return state.map(group => group.id in action.groups
        ? {
          ...group,
          sessionStarted: true
        }
        : group
      )

    case 'EVENT_QUEUE_AgentGroupDataUpdate':
      // this is OK, because the max number of groups an user can join is 60.
      return action.body.GroupData.reduce((groups, groupData) => {
        const id = groupData.GroupID

        const index = groups.findIndex(group => group.id === id)
        const isNewGroup = index < 0

        const newGroupData = {
          ...(isNewGroup ? { title: '' } : groups[index]),
          id,
          name: groupData.GroupName,
          insigniaID: groupData.GroupInsigniaID,
          acceptNotices: groupData.AcceptNotices,
          powers: Buffer.from(groupData.GroupPowers),
          listInProfile: groupData.ListInProfile
        }

        return isNewGroup
          ? groups.concat([newGroupData])
          : [
            ...groups.slice(0, index),
            newGroupData,
            ...groups.slice(index + 1)
          ]
      }, state)

    case 'DidLogout':
    case 'UserWasKicked':
      return []

    default:
      return state
  }
}
