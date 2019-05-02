// Selectors for names

import { createSelector } from 'reselect'

import { getIsLoggedIn, getAgentId } from './session'

export const getNames = state => state.names.names

export const getAvatarNameById = (state, id) => getNames(state)[id]

export const getDisplayNamesURL = state => state.names.getDisplayNamesURL

export const getOwnAvatarName = createSelector(
  [
    getIsLoggedIn,
    getAgentId,
    getNames
  ],
  (isLoggedIn, agentId, names) => isLoggedIn
    ? names[agentId]
    : null
)
