import { createSelector } from 'reselect'

import { startGroupChat } from '../actions/groupsActions'

export const groupsDidLoad = createSelector(
  [
    state => state.groups
  ],
  (() => {
    let lastCount = 0
    let lastGroupIds = []

    return groups => {
      if (lastCount === groups.size || groups.size === 0) return null

      const changedGroups = groups.filter(group => !lastGroupIds.includes(group.get('id')))

      lastCount = groups.size
      lastGroupIds = groups.map(group => group.get('id')).toJSON()

      return startGroupChat(changedGroups.toJSON())
    }
  })()
)
