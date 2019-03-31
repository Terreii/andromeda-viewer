// Selectors for general session-data

import { createSelector } from 'reselect'

export const getAvatarIdentifier = state => state.account.get('avatarIdentifier')

export const getAvatarDataSaveId = state => state.account.get('avatarDataSaveId')

export const getErrorMessage = state => state.session.get('error')

export const getAgentId = state => state.session.get('agentId')

export const getSessionId = state => state.session.get('sessionId')

export const getIsLoggedIn = createSelector(
  [
    getAvatarIdentifier,
    getSessionId
  ],
  (avatarIdentifier, sessionId) => avatarIdentifier != null &&
    avatarIdentifier.length > 0 &&
    sessionId != null
)
