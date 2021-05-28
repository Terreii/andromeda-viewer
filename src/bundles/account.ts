import { createSlice, createSelector, PayloadAction, Action } from '@reduxjs/toolkit'

import { RootState } from '../store/configureStore'
import type { LoginAction } from './session'
import { AvatarData, SavedAvatarData, Grid, HoodieObject } from '../types/viewer'

// Reducer for viewer-account and state

const accountSlice = createSlice({
  name: 'account',

  initialState: getDefault(),

  reducers: {
    signInStatus: {
      reducer (
        state,
        action: PayloadAction<{ isLoggedIn: boolean, isUnlocked: boolean | null, username: string}>
      ) {
        if (action.payload.isUnlocked != null) {
          state.unlocked = action.payload.isUnlocked
        }
        state.loggedIn = action.payload.isLoggedIn
        state.username = action.payload.username
      },
      prepare (isSignedIn: boolean, isUnlocked: boolean | null, username: string = '') {
        const isLoggedIn = Boolean(isSignedIn)
        return {
          payload: {
            isLoggedIn,
            isUnlocked: isUnlocked,
            username: isLoggedIn ? username : ''
          }
        }
      }
    },

    signOut: getDefault,

    unlocked (state) {
      state.unlocked = true
    },

    displayResetKeys (state, action: PayloadAction<string[]>) {
      state.resetKeys = action.payload
    },

    closeResetKeys (state, action: Action) {
      state.resetKeys = null
    },

    didUpdateUsername (state, action: PayloadAction<{ username: string }>) {
      state.username = action.payload.username
    },

    avatarSaved (state, action: PayloadAction<SavedAvatarData>) {
      state.savedAvatars.push(action.payload)
    },

    avatarsLoaded (state, action: PayloadAction<SavedAvatarData[]>) {
      state.savedAvatars = action.payload
      state.savedAvatarsLoaded = true
    },

    savedAvatarUpdated (state, action: PayloadAction<SavedAvatarData>) {
      const index = state.savedAvatars.findIndex(avatar => avatar._id === action.payload._id)
      if (index >= 0) {
        state.savedAvatars[index] = action.payload
      }
    },

    savedAvatarRemoved (state, action: PayloadAction<SavedAvatarData | HoodieObject>) {
      state.savedAvatars = state.savedAvatars.filter(avatar => avatar._id !== action.payload._id)
    },

    gridAdded (state, action: PayloadAction<Grid>) {
      state.savedGrids.push(action.payload)
    },

    gridsLoaded (state, action: PayloadAction<Grid[]>) {
      state.savedGrids.push(...action.payload)
      state.savedGridsLoaded = true
    },

    savedGridDidChanged (state, action: PayloadAction<Grid>) {
      const index = state.savedGrids.findIndex(grid => {
        return grid._id != null // If grid has an id
          ? grid._id === action.payload._id
          : grid.name === action.payload.name
      })

      state.savedGrids[index] = action.payload
    },

    savedGridRemoved (state, action: PayloadAction<Grid>) {
      state.savedGrids = state.savedGrids.filter(grid => grid._id != null
        ? grid._id !== action.payload._id
        : grid.name !== action.payload.name
      )
    }
  },

  extraReducers: {
    'session/login' (state, action: PayloadAction<LoginAction>) {
      const { save, grid, name, avatarIdentifier, dataSaveId } = action.payload
      if (!save) { // Anonym
        state.anonymAvatarData = {
          grid: grid.name,
          name: name.firstName + ' ' + name.lastName,
          avatarIdentifier,
          dataSaveId
        }
      }
    },

    'session/logout' (state) {
      state.anonymAvatarData = null
    },
    'session/userWasKicked' (state) {
      state.anonymAvatarData = null
    }
  }
})

export default accountSlice.reducer

export const {
  signInStatus,
  signOut,
  unlocked,
  didUpdateUsername,

  displayResetKeys,
  closeResetKeys,

  avatarSaved,
  avatarsLoaded,
  savedAvatarUpdated,
  savedAvatarRemoved,

  gridAdded,
  gridsLoaded,
  savedGridDidChanged,
  savedGridRemoved
} = accountSlice.actions

// Selectors

export const selectIsSignedIn = (state: RootState) => state.account.loggedIn

export const selectIsUnlocked = (state: RootState) => state.account.unlocked

export const selectUserName = (state: RootState) => state.account.username

export const selectSavedAvatars = (state: RootState) => state.account.savedAvatars

export const selectSavedAvatarsAreLoaded = (state: RootState) => state.account.savedAvatarsLoaded

export const selectAnonymAvatarData = (state: RootState) => state.account.anonymAvatarData!

export const selectSavedGrids = (state: RootState) => state.account.savedGrids as Grid[]

export const selectGridsByName = createSelector(
  selectSavedGrids,
  grids => {
    const allGrids: { [key: string]: Grid } = {}
    for (const grid of grids) {
      allGrids[grid.name] = grid
    }
    return allGrids
  }
)

export const selectSavedGridsAreLoaded = (state: RootState) => state.account.savedGridsLoaded

export const selectShowUnlockDialog = createSelector(
  [
    selectIsSignedIn,
    selectIsUnlocked
  ],
  (isSignedIn, isUnlocked) => !isUnlocked && isSignedIn
)

export const selectResetKeys = (state: RootState) => state.account.resetKeys

// Helpers

function getDefault () {
  const defaultData = {
    unlocked: false,
    loggedIn: false,
    username: '',
    resetKeys: ((): string[] | null => null)(),
    savedAvatars: ((): SavedAvatarData[] => [])(),
    savedAvatarsLoaded: false,
    anonymAvatarData: ((): AvatarData | null => null)(),
    savedGrids: ((): Grid[] => [
      {
        _id: 'second_life',
        name: 'Second Life',
        loginURL: 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi',
        isLLSDLogin: true
      },
      {
        _id: 'second_life_beta',
        name: 'Second Life Beta',
        loginURL: 'https://login.aditi.lindenlab.com/cgi-bin/login.cgi',
        isLLSDLogin: true
      },
      {
        _id: 'os_grid',
        name: 'OS Grid',
        loginURL: 'http://login.osgrid.org/',
        isLLSDLogin: false
      }
    ])(),
    savedGridsLoaded: false
  }
  return defaultData
}

// Types

type SignInPopup = 'resetKeys' | 'Error' | null

export type PopupType = SignInPopup | 'unlock'
