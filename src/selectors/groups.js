// Selectors for groups

import { createSelector } from 'reselect'

export const getGroups = state => state.groups

export const getGroupsWithNoActiveChat = createSelector(
  [
    getGroups
  ],
  groups => groups.filter(group => !group.sessionStarted)
)
