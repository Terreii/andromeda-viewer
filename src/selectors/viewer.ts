// Selectors for viewer:
// Account and other general state

import { AvatarData, SavedAvatarData, Grid } from '../types/viewer'

export const getIsSignedIn = (state: any): boolean => state.account.loggedIn

export const getIsUnlocked = (state: any): boolean => state.account.unlocked

export const getUserName = (state: any): string => state.account.username

export const getSavedAvatars = (state: any): SavedAvatarData[] => state.account.savedAvatars

export const getSavedAvatarsAreLoaded = (state: any): boolean => state.account.savedAvatarsLoaded

export const getAnonymAvatarData = (state: any): AvatarData => state.account.anonymAvatarData

export const getSavedGrids = (state: any): Grid[] => state.account.savedGrids

export const getSavedGridsAreLoaded = (state: any): boolean => state.account.savedGridsLoaded

export const getShouldSync = (state: any): boolean => state.account.sync
