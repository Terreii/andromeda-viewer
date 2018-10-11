import { createSelector } from 'reselect'

import { startGroupChat } from '../actions/groupsActions'

export const groupsDidLoad = createSelector(
  [
    state => state.groups
  ],
  groups => {
    const groupsWithNoImSession = groups.filter(group => !group.get('sessionStarted'))

    if (groupsWithNoImSession.size === 0) return null

    return startGroupChat(groupsWithNoImSession.toJSON())
  }
)
