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

    case 'DidLogout':
    case 'UserWasKicked':
      return List()

    default:
      return state
  }
}
