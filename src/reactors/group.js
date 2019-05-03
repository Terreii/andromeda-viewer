import { createSelector } from 'reselect'

import { startGroupChat } from '../actions/groupsActions'

import { getGroupsWithNoActiveChat } from '../selectors/groups'

export const groupsDidLoad = createSelector(
  [
    getGroupsWithNoActiveChat
  ],
  groupsWithNoImSession => groupsWithNoImSession.length !== 0
    ? startGroupChat(groupsWithNoImSession)
    : null
)
