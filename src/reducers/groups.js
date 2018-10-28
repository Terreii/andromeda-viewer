// Groups of the avatar

import { List, Map } from 'immutable'

import { getValueOf, mapBlockOf } from '../network/msgGetters'

export default function groupsReducer (state = List(), action) {
  switch (action.type) {
    case 'UDPAvatarGroupsReply':
      if (
        getValueOf(action, 'AgentData', 0, 'AgentID') !==
        getValueOf(action, 'AgentData', 0, 'AvatarID')
      ) {
        return state
      }
      return List(
        mapBlockOf(action, 'GroupData', getValue => Map({
          id: getValue('GroupID'),
          name: getValue('GroupName', true),
          insigniaID: getValue('GroupInsigniaID'),
          title: getValue('GroupTitle', true),
          acceptNotices: getValue('AcceptNotices'),
          powers: getValue('GroupPowers')
        }))
      )

    case 'ChatSessionsStarted':
      return state.map(group => action.chatUUIDs.includes(group.get('id'))
        ? group.set('sessionStarted', true)
        : group
      )

    case 'EVENT_QUEUE_AgentGroupDataUpdate':
      return state.withMutations(groups => {
        action.body.GroupData.reduce((groups, groupData) => {
          const id = groupData.GroupID.uuid

          const index = groups.findIndex(group => group.get('id') === id)
          const isNewGroup = index < 0

          const oldGroup = isNewGroup ? Map() : groups.get(index)
          const newGroupData = oldGroup.merge({
            id,
            name: groupData.GroupName,
            insigniaID: groupData.GroupInsigniaID.uuid,
            acceptNotices: groupData.AcceptNotices,
            powers: Buffer.from(groupData.GroupPowers.octets),
            listInProfile: groupData.ListInProfile
          })

          return isNewGroup
            ? groups.push(newGroupData)
            : groups.set(index, newGroupData)
        }, groups)
      })

    case 'DidLogout':
    case 'UserWasKicked':
      return List()

    default:
      return state
  }
}
