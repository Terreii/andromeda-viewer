// Selectors for groups

import { createSelector } from 'reselect'

export interface Group {
  id: string
  name: string
  insigniaID: string
  title: string
  acceptNotices: boolean
  listInProfile: boolean
  powers: Buffer
  sessionStarted: boolean
}

export const getGroups = (state: any): Group[] => state.groups

export const getGroupsWithNoActiveChat = createSelector(
  [
    getGroups
  ],
  groups => groups.filter(group => !group.sessionStarted)
)
