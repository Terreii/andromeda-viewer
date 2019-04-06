// Selectors for names

import { createSelector } from 'reselect'

import { getIsLoggedIn, getAgentId } from './session'

export const getNames = state => state.names.get('names')

export const getAvatarNameById = (state, id) => state.names.getIn(['names', id])

export const getDisplayNamesURL = state => state.names.get('getDisplayNamesURL')

export const getOwnAvatarName = createSelector(
  [
    getIsLoggedIn,
    getAgentId,
    getNames
  ],
  (isLoggedIn, agentId, names) => isLoggedIn
    ? names.get(agentId)
    : null
)
