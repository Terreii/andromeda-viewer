// Selectors for groups

import { createSelector } from 'reselect'

import { Group } from '../types/groups'

export const getGroups = (state: any): Group[] => state.groups

export const getGroupsWithNoActiveChat = createSelector(
  [
    getGroups
  ],
  groups => groups.filter(group => !group.sessionStarted)
)
