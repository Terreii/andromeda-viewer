import { createSelector } from 'reselect'

import { startGroupChat } from '../actions/groupsActions'

import { getGroupsWithNoActiveChat } from '../selectors/groups'

export const groupsDidLoad = createSelector(
  [
    getGroupsWithNoActiveChat
  ],
  groupsWithNoImSession => groupsWithNoImSession.size !== 0
    ? startGroupChat(groupsWithNoImSession.toJSON())
    : null
)
