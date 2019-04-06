// Selectors for general session-data

import { createSelector } from 'reselect'

import { getSavedAvatars, getAnonymAvatarData } from './viewer'

export const getAvatarIdentifier = state => state.session.get('avatarIdentifier')

export const getCurrentAvatarData = createSelector(
  [
    getSavedAvatars,
    getAnonymAvatarData,
    getAvatarIdentifier
  ],
  (savedAvatars, anonymAvatarData, avatarIdentifier) => anonymAvatarData != null
    ? anonymAvatarData
    : savedAvatars.find(avatarData => avatarData.get('avatarIdentifier') === avatarIdentifier)
)

export const getAvatarDataSaveId = createSelector(
  [
    getCurrentAvatarData
  ],
  avatarData => avatarData.get('dataSaveId')
)

export const getErrorMessage = state => state.session.get('error')

export const getAgentId = state => state.session.get('agentId')

export const getSessionId = state => state.session.get('sessionId')

export const getIsLoggedIn = createSelector(
  [
    getAvatarIdentifier,
    getSessionId
  ],
  (avatarIdentifier, sessionId) => avatarIdentifier != null && sessionId != null
)
