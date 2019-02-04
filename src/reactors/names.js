import { createSelector } from 'reselect'

import { getDisplayName } from '../actions/friendsActions'

import { getNames } from '../selectors/names'

export const loadNames = createSelector(
  [
    getNames
  ],
  names => names.some(name => !name.willHaveDisplayName())
    ? getDisplayName()
    : null
)
