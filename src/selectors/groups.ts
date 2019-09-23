// Selectors for groups

import { createSelector } from 'reselect'

import { Group } from '../types/groups'

export const getGroups = (state: any): Group[] => state.groups

export const getGroupsIDs = createSelector(
  [
    getGroups
  ],
  groups => groups.map(group => group.id)
)

export const getGroupsWithNoActiveChat = createSelector(
  [
    getGroups
  ],
  groups => groups.filter(group => !group.sessionStarted)
)
