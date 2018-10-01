import { createSelector } from 'reselect'

import { getDisplayName } from '../actions/friendsActions'

import { getNames } from '../selectors/names'

export const loadNames = createSelector(
  [
    getNames
  ],
  names => {
    const shouldLoad = names.some(name => {
      if (name.willHaveDisplayName()) {
        return false
      } else {
        return true
      }
    })

    if (shouldLoad) {
      return getDisplayName()
    } else {
      return null
    }
  }
)
