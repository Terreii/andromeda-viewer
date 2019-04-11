// Selectors for groups

import { createSelector } from 'reselect'

export const getGroups = state => state.groups

export const getGroupsIDs = createSelector(
  [
    getGroups
  ],
  groups => groups.map(group => group.get('id')).toJSON()
)

export const getGroupsWithNoActiveChat = createSelector(
  [
    getGroups
  ],
  groups => groups.filter(group => !group.get('sessionStarted'))
)
