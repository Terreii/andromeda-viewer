// Selectors for names

import { Map } from 'immutable'

import AvatarName from '../avatarName'

import { createSelector } from 'reselect'

import { getIsLoggedIn, getAgentId } from './session'

export const getNames = (state: any): Map<string, AvatarName> => state.names.get('names')

export const getAvatarNameById = (state: any, id: string): AvatarName => (
  state.names.getIn(['names', id])
)

export const getDisplayNamesURL = (state: any): string => state.names.get('getDisplayNamesURL')

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
