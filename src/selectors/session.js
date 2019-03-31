// Selectors for general session-data

export const getIsLoggedIn = state => state.session.get('loggedIn')

export const getAvatarName = state => state.account.get('avatarName')

export const getAvatarIdentifier = state => state.account.get('avatarIdentifier')

export const getAvatarDataSaveId = state => state.account.get('avatarDataSaveId')

export const getErrorMessage = state => state.session.get('error')

export const getAgentId = state => state.session.get('agentId')

export const getSessionId = state => state.session.get('sessionId')
