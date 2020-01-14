import { createSelector } from 'reselect'

import { getDisplayName } from '../actions/friendsActions'

import { selectNames } from '../bundles/names'

export const loadNames = createSelector(
  [
    selectNames
  ],
  names => Object.values(names).some(name => !name.willHaveDisplayName())
    ? getDisplayName()
    : null
)
