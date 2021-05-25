import { createSelector } from 'reselect'

import { getDisplayName } from '../actions/friendsActions'

import { selectIdOfNamesToLoad } from '../bundles/names'

export const loadNames = createSelector(
  [
    selectIdOfNamesToLoad
  ],
  namesToLoad => namesToLoad.length > 0
    ? getDisplayName()
    : null
)
