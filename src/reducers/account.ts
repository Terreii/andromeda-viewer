import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { AvatarData, SavedAvatarData, Grid, HoodieObject } from '../types/viewer'

// Reducer for viewer-account and state

const accountSlice = createSlice({
  name: 'account',

  initialState: getDefault(),

  reducers: {
    // ViewerAccountLogInStatus
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
  
    // ViewerAccountSignOut
    signOut: getDefault,
  
    // ViewerAccountUnlocked
    unlocked (state) {
      state.unlocked = true
    },
  
    // ShowSignInPopup
    // ShowSignOutPopup
    showPopup (state, action: PayloadAction<'unlock' | 'signIn' | 'signUp' | 'signOut' | 'Error'>) {
      state.signInPopup = action.payload
    },
  
    // SHOW_PASSWORD_RESET
    showPasswordReset (state, action: PayloadAction<'encryption' | 'account'>) {
      state.signInPopup = 'resetPassword'
      state.popupData = action.payload
    },
  
    // DISPLAY_VIEWER_ACCOUNT_RESET_KEYS
    displayResetKeys (state, action: PayloadAction<string[]>) {
      state.signInPopup = 'resetKeys'
      state.popupData = action.payload
    },
  
    // VIEWER_ACCOUNT_DID_UPDATE
    didUpdate (state: { [key: string]: any }, action: PayloadAction<{ [key: string]: any }>) {
      Object.entries(action.payload)
        .filter(([key]) => key !== 'id')
        .forEach(([key, value]) => {
          state[key] = value
        })
    },
  
    // ClosePopup
    closePopup (state) {
      state.signInPopup = ''
      state.popupData = null
    },
  
    // AvatarSaved
    avatarSaved (state, action: PayloadAction<SavedAvatarData>) {
      state.savedAvatars.push(action.payload)
    },
  
    // AvatarsLoaded
    avatarsLoaded (state, action: PayloadAction<SavedAvatarData[]>) {
      state.savedAvatars = action.payload
      state.savedAvatarsLoaded = true
    },
  
    // SavedAvatarUpdated
    savedAvatarUpdated (state, action: PayloadAction<SavedAvatarData>) {
      const index = state.savedAvatars.findIndex(avatar => avatar._id === action.payload._id)
      if (index >= 0) {
        state.savedAvatars[index] = action.payload
      }
    },
  
    // SavedAvatarRemoved
    savedAvatarRemoved (state, action: PayloadAction<SavedAvatarData | HoodieObject>) {
      state.savedAvatars = state.savedAvatars.filter(avatar => avatar._id !== action.payload._id)
    },
  
    // GridAdded
    gridAdded (state, action: PayloadAction<Grid>) {
      state.savedGrids.push(action.payload)
    },
  
    // GridsLoaded
    gridsLoaded (state, action: PayloadAction<Grid[]>) {
      state.savedGrids.push(...action.payload)
      state.savedGridsLoaded = true
    },
  
    // SavedGridDidChanged
    savedGridDidChanged (state, action: PayloadAction<Grid>) {
      const index = state.savedGrids.findIndex(grid => {
        return grid._id != null // If grid has an id
          ? grid._id === action.payload._id
          : grid.name === action.payload.name
      })
  
      state.savedGrids[index] = action.payload
    },
  
    // SavedGridRemoved
    savedGridRemoved (state, action: PayloadAction<Grid>) {
      state.savedGrids = state.savedGrids.filter(grid => grid._id != null
        ? grid._id !== action.payload._id
        : grid.name !== action.payload.name
      )
    }
  },
  
  extraReducers: {
    didLogin (state, action) {
      if (action.save) {
        state.sync = action.save
      } else { // Anonym
        state.sync = action.save
        state.anonymAvatarData = {
          grid: action.grid.name,
          name: action.name.getFullName(),
          avatarIdentifier: action.avatarIdentifier,
          dataSaveId: action.dataSaveId
        }
      }
    },
  
    loginDidFail (state) {
      state.sync = false
    },

    DidLogout (state) {
      state.anonymAvatarData = null
      state.sync = false
    },
    UserWasKicked (state) {
      state.anonymAvatarData = null
      state.sync = false
    }
  }
})

export default accountSlice.reducer

export const {
  signInStatus,
  signOut,
  unlocked,
  didUpdate,

  showPopup,
  showPasswordReset,
  displayResetKeys,
  closePopup,

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

export const selectIsSignedIn = (state: any): boolean => state.account.loggedIn

export const selectIsUnlocked = (state: any): boolean => state.account.unlocked

export const selectUserName = (state: any): string => state.account.username

export const selectSavedAvatars = (state: any): SavedAvatarData[] => state.account.savedAvatars

export const selectSavedAvatarsAreLoaded = (state: any): boolean => state.account.savedAvatarsLoaded

export const selectAnonymAvatarData = (state: any): AvatarData => state.account.anonymAvatarData

export const selectSavedGrids = (state: any): Grid[] => state.account.savedGrids

export const selectSavedGridsAreLoaded = (state: any): boolean => state.account.savedGridsLoaded

export const selectShouldSync = (state: any): boolean => state.account.sync

// Helpers

function getDefault () {
  const defaultData = {
    sync: false,
    unlocked: false,
    loggedIn: false,
    username: '',
    signInPopup: '',
    popupData: null as string | string[] | null,
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
