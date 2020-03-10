import { createSlice, createSelector, PayloadAction, Action } from '@reduxjs/toolkit'

import { AvatarData, SavedAvatarData, Grid, HoodieObject } from '../types/viewer'

// Reducer for viewer-account and state

export const currentToSVersion = 1

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
  
    signOut (state, action) {
      const nextState = getDefault()
      nextState.tos = state.tos
      return nextState
    },
  
    unlocked (state) {
      state.unlocked = true
    },
  
    displayResetKeys (state, action: PayloadAction<string[]>) {
      state.resetKeys = action.payload
    },

    closeResetKeys (state, action: Action) {
      state.resetKeys = null
    },
  
    didUpdate (state: { [key: string]: any }, action: PayloadAction<{ [key: string]: any }>) {
      Object.entries(action.payload)
        .filter(([key]) => key !== 'id')
        .forEach(([key, value]) => {
          state[key] = value
        })
    },

    didLoadToSState (state, action: PayloadAction<{ isNew: boolean, doc: ToSStateDoc | null }>) {
      state.tos.loading = false
      if (action.payload.isNew) {
        state.tos.version = 0
      } else {
        state.tos.version = action.payload.doc?.version ?? 0
      }
    },

    didAgreeToToS (state, action: Action) {
      state.tos.version = currentToSVersion
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
    'session/login' (state, action: PayloadAction<any>) {
      if (!action.payload.save) { // Anonym
        state.anonymAvatarData = {
          grid: action.payload.grid.name,
          name: action.payload.name.getFullName(),
          avatarIdentifier: action.payload.avatarIdentifier,
          dataSaveId: action.payload.dataSaveId
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
  didUpdate,

  displayResetKeys,
  closeResetKeys,

  didLoadToSState,
  didAgreeToToS,

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

export const selectIsSignedIn = (state: State): boolean => state.account.loggedIn

export const selectIsUnlocked = (state: State): boolean => state.account.unlocked

export const selectUserName = (state: State): string => state.account.username

export const selectSavedAvatars = (state: State): SavedAvatarData[] => state.account.savedAvatars

export const selectSavedAvatarsAreLoaded = (state: State): boolean =>
  state.account.savedAvatarsLoaded

export const selectAnonymAvatarData = (state: State): AvatarData | null =>
  state.account.anonymAvatarData

export const selectSavedGrids = (state: State): Grid[] => state.account.savedGrids

export const selectSavedGridsAreLoaded = (state: State): boolean => state.account.savedGridsLoaded

export const selectShowUnlockDialog = createSelector(
  [
    selectIsSignedIn,
    selectIsUnlocked,
  ],
  (isSignedIn, isUnlocked) => !isUnlocked && isSignedIn
)

export const selectResetKeys = (state: State): string[] | null => state.account.resetKeys

export const selectToS = (state: State) => state.account.tos

export const selectShowToS = createSelector(
  [
    selectToS,
    selectIsSignedIn,
    selectIsUnlocked
  ],
  (tos, isSignedIn, isUnlocked): boolean => {
    if ((isSignedIn && !isUnlocked) || tos.loading) return false

    return tos.version < currentToSVersion
  }
)

// Helpers

function getDefault () {
  const defaultData = {
    unlocked: false,
    loggedIn: false,
    username: '',
    resetKeys: null as string[] | null,
    tos: {
      loading: true,
      version: 0
    },
    savedAvatars: [] as SavedAvatarData[],
    savedAvatarsLoaded: false,
    anonymAvatarData: null as AvatarData | null,
    savedGrids: [
      {
        name: 'Second Life',
        loginURL: 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi',
        isLLSDLogin: true
      },
      {
        name: 'Second Life Beta',
        loginURL: 'https://login.aditi.lindenlab.com/cgi-bin/login.cgi',
        isLLSDLogin: true
      },
      {
        name: 'OS Grid',
        loginURL: 'http://login.osgrid.org/',
        isLLSDLogin: false
      }
    ] as Grid[],
    savedGridsLoaded: false
  }
  return defaultData
}

// Types

interface State {
  account: ReturnType<typeof accountSlice.reducer>
}

interface ToSStateDoc extends HoodieObject {
  _id: 'terms_of_service',
  version: number
}

type SignInPopup = 'resetKeys' | 'Error' | null

export type PopupType = SignInPopup | 'unlock'
