// Selectors for names

import AvatarName from '../avatarName'

import { createSelector } from 'reselect'

import { getIsLoggedIn, getAgentId } from './session'

export interface NamesStore {
  [key: string]: AvatarName
}

export const getNames = (state: any): NamesStore => state.names.names

export function getAvatarNameById (state: any, id: string): AvatarName | undefined {
  return getNames(state)[id]
}

export const getDisplayNamesURL = (state: any): string => state.names.getDisplayNamesURL

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
