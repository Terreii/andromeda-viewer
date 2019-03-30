// Selectors for viewer:
// Account and other general state

export const getIsSignedIn = state => state.account.getIn(['viewerAccount', 'loggedIn'])

export const getIsUnlocked = state => state.account.get('unlocked')

export const getSavedAvatars = state => state.account.get('savedAvatars')

export const getSavedAvatarsAreLoaded = state => state.account.get('savedAvatarsLoaded')

export const getSavedGrids = state => state.account.get('savedGrids')

export const getSavedGridsAreLoaded = state => state.account.get('savedGridsLoaded')
