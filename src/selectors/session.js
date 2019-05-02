// Selectors for general session-data

import { createSelector } from 'reselect'

import { getSavedAvatars, getAnonymAvatarData } from './viewer'

export const getAvatarIdentifier = state => state.session.avatarIdentifier

export const getCurrentAvatarData = createSelector(
  [
    getSavedAvatars,
    getAnonymAvatarData,
    getAvatarIdentifier
  ],
  (savedAvatars, anonymAvatarData, avatarIdentifier) => anonymAvatarData != null
    ? anonymAvatarData
    : savedAvatars.find(avatarData => avatarData.avatarIdentifier === avatarIdentifier)
)

export const getAvatarDataSaveId = createSelector(
  [
    getCurrentAvatarData
  ],
  avatarData => avatarData.dataSaveId
)

export const getErrorMessage = state => state.session.error

export const getAgentId = state => state.session.agentId

export const getSessionId = state => state.session.sessionId

export const getIsLoggedIn = createSelector(
  [
    getAvatarIdentifier,
    getSessionId
  ],
  (avatarIdentifier, sessionId) => avatarIdentifier != null && sessionId != null
)
