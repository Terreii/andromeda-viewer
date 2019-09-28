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

export default function accountReducer (state = getDefault(), action) {
  switch (action.type) {
    case 'didLogin':
      if (action.save) {
        return {
          ...state,
          sync: action.save
        }
      } else { // Anonym
        return {
          ...state,
          sync: action.save,
          anonymAvatarData: {
            grid: action.grid.name,
            name: action.name.getFullName(),
            avatarIdentifier: action.avatarIdentifier,
            dataSaveId: action.dataSaveId
          }
        }
      }

    case 'loginDidFail':
      return {
        ...state,
        sync: false
      }

    case 'ViewerAccountLogInStatus':
      return {
        ...state,
        unlocked: action.isUnlocked == null ? state.unlocked : action.isUnlocked,
        loggedIn: action.isLoggedIn,
        username: action.username
      }

    case 'ViewerAccountSignOut':
      return getDefault()

    case 'ViewerAccountUnlocked':
      return {
        ...state,
        unlocked: true
      }

    case 'ShowSignInPopup':
      return {
        ...state,
        signInPopup: action.popup
      }

    case 'ShowSignOutPopup':
      return {
        ...state,
        signInPopup: 'signOut'
      }

    case 'SHOW_PASSWORD_RESET':
      return {
        ...state,
        signInPopup: 'resetPassword',
        popupData: action.passwordType
      }

    case 'DISPLAY_VIEWER_ACCOUNT_RESET_KEYS':
      return {
        ...state,
        signInPopup: 'resetKeys',
        popupData: action.resetKeys
      }

    case 'VIEWER_ACCOUNT_DID_UPDATE':
      return Object.entries(action.changes)
        .filter(([key]) => key !== 'id')
        .reduce(
          (state, [key, value]) => {
            state[key] = value
            return state
          },
          { ...state }
        )

    case 'ClosePopup':
      return {
        ...state,
        signInPopup: '',
        popupData: null
      }

    case 'AvatarSaved':
      return {
        ...state,
        savedAvatars: state.savedAvatars.concat([
          action.avatar
        ])
      }

    case 'AvatarsLoaded':
      return {
        ...state,
        savedAvatars: action.avatars,
        savedAvatarsLoaded: true
      }

    case 'SavedAvatarUpdated':
      return {
        ...state,
        savedAvatars: state.savedAvatars.map(avatar => avatar._id === action.avatar._id
          ? action.avatar
          : avatar
        )
      }

    case 'SavedAvatarRemoved':
      return {
        ...state,
        savedAvatars: state.savedAvatars.filter(avatar => avatar._id !== action.avatar._id)
      }

    case 'GridAdded':
      return {
        ...state,
        savedGrids: state.savedGrids.concat([
          action.grid
        ])
      }

    case 'GridsLoaded':
      return {
        ...state,
        savedGrids: state.savedGrids.concat(action.grids),
        savedGridsLoaded: true
      }

    case 'SavedGridDidChanged':
      return {
        ...state,
        savedGrids: state.savedGrids.map(grid => {
          if (grid._id != null) { // If grid has an id
            return grid._id === action.grid._id
              ? action.grid
              : grid
          } else {
            return grid.name === action.grid.name
              ? action.grid
              : grid
          }
        })
      }

    case 'SavedGridRemoved':
      return {
        ...state,
        savedGrids: state.savedGrids.filter(grid => grid._id != null
          ? grid._id !== action.grid._id
          : grid.name !== action.grid.name
        )
      }

    case 'DidLogout':
    case 'UserWasKicked':
      return {
        ...state,
        anonymAvatarData: null,
        sync: false
      }

    default:
      return state
  }
}
