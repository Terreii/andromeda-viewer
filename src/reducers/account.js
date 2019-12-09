import { createReducer } from '@reduxjs/toolkit'

// Reducer for viewer-account and state

function getDefault () {
  const defaultData = {
    sync: false,
    unlocked: false,
    loggedIn: false,
    username: '',
    signInPopup: '',
    popupData: null,
    savedAvatars: [],
    savedAvatarsLoaded: false,
    anonymAvatarData: null,
    savedGrids: [
      {
        name: 'Second Life',
        loginURL: 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi',
        isLoginLLSD: true
      },
      {
        name: 'Second Life Beta',
        loginURL: 'https://login.aditi.lindenlab.com/cgi-bin/login.cgi',
        isLoginLLSD: true
      },
      {
        name: 'OS Grid',
        loginURL: 'http://login.osgrid.org/'
      }
    ],
    savedGridsLoaded: false
  }
  return defaultData
}

export default createReducer(getDefault(), {
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

  ViewerAccountLogInStatus (state, action) {
    if (action.isUnlocked != null) {
      state.unlocked = action.isUnlocked
    }
    state.loggedIn = action.isLoggedIn
    state.username = action.username
  },

  ViewerAccountSignOut: getDefault,

  ViewerAccountUnlocked (state) {
    state.unlocked = true
  },

  ShowSignInPopup (state, action) {
    state.signInPopup = action.popup
  },

  ShowSignOutPopup (state, action) {
    state.signInPopup = 'signOut'
  },

  SHOW_PASSWORD_RESET (state, action) {
    state.signInPopup = 'resetPassword'
    state.popupData = action.passwordType
  },

  DISPLAY_VIEWER_ACCOUNT_RESET_KEYS (state, action) {
    state.signInPopup = 'resetKeys'
    state.popupData = action.resetKeys
  },

  VIEWER_ACCOUNT_DID_UPDATE (state, action) {
    Object.entries(action.changes)
      .filter(([key]) => key !== 'id')
      .forEach(([key, value]) => {
        state[key] = value
      })
  },

  ClosePopup (state, action) {
    state.signInPopup = ''
    state.popupData = null
  },

  AvatarSaved (state, action) {
    state.savedAvatars.push(action.avatar)
  },

  AvatarsLoaded (state, action) {
    state.savedAvatars = action.avatars
    state.savedAvatarsLoaded = true
  },

  SavedAvatarUpdated (state, action) {
    const index = state.savedAvatars.findIndex(avatar => avatar._id === action.avatar._id)
    if (index >= 0) {
      state.savedAvatars[index] = action.avatar
    }
  },

  SavedAvatarRemoved (state, action) {
    state.savedAvatars = state.savedAvatars.filter(avatar => avatar._id !== action.avatar._id)
  },

  GridAdded (state, action) {
    state.savedGrids.push(action.grid)
  },

  GridsLoaded (state, action) {
    state.savedGrids.push(...action.grids)
    state.savedGridsLoaded = true
  },

  SavedGridDidChanged (state, action) {
    const index = state.savedGrids.findIndex(grid => {
      return grid._id != null // If grid has an id
        ? grid._id === action.grid._id
        : grid.name === action.grid.name
    })

    state.savedGrids[index] = action.grid
  },

  SavedGridRemoved (state, action) {
    state.savedGrids = state.savedGrids.filter(grid => grid._id != null
      ? grid._id !== action.grid._id
      : grid.name !== action.grid.name
    )
  },

  DidLogout: onLogout,
  UserWasKicked: onLogout
})

function onLogout (state) {
  state.anonymAvatarData = null
  state.sync = false
}
