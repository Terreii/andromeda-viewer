// Selectors for viewer:
// Account and other general state

export const getIsSignedIn = state => state.account.get('loggedIn')

export const getIsUnlocked = state => state.account.get('unlocked')

export const getUserName = state => state.account.get('username')

export const getSavedAvatars = state => state.account.get('savedAvatars')

export const getSavedAvatarsAreLoaded = state => state.account.get('savedAvatarsLoaded')

export const getAnonymAvatarData = state => state.account.get('anonymAvatarData')

export const getSavedGrids = state => state.account.get('savedGrids')

export const getSavedGridsAreLoaded = state => state.account.get('savedGridsLoaded')

export const getShouldSync = state => state.account.get('sync')
