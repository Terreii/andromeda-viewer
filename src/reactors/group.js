import { createSelector } from 'reselect'

import { startGroupChat } from '../actions/groupsActions'

import { selectGroupsWithNoActiveChat } from '../reducers/groups'

export const groupsDidLoad = createSelector(
  [
    selectGroupsWithNoActiveChat
  ],
  groupsWithNoImSession => groupsWithNoImSession.length !== 0
    ? startGroupChat(groupsWithNoImSession)
    : null
)
