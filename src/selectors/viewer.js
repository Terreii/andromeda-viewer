// Selectors for viewer:
// Account and other general state

export const getIsSignedIn = state => state.account.loggedIn

export const getIsUnlocked = state => state.account.unlocked

export const getUserName = state => state.account.username

export const getSavedAvatars = state => state.account.savedAvatars

export const getSavedAvatarsAreLoaded = state => state.account.savedAvatarsLoaded

export const getAnonymAvatarData = state => state.account.anonymAvatarData

export const getSavedGrids = state => state.account.savedGrids

export const getSavedGridsAreLoaded = state => state.account.savedGridsLoaded

export const getShouldSync = state => state.account.sync
