import Immutable from 'immutable'

function getDefault () {
  const defaultData = {
    avatarIdentifier: '',
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
        loginURL: 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi'
      },
      {
        name: 'Second Life Beta',
        loginURL: 'https://login.aditi.lindenlab.com/cgi-bin/login.cgi'
      },
      {
        name: 'OS Grid',
        loginURL: 'http://login.osgrid.org/'
      }
    ],
    savedGridsLoaded: false
  }
  return Immutable.fromJS(defaultData)
}

export default function accountReducer (state = getDefault(), action) {
  switch (action.type) {
    case 'startLogin':
      return state.merge({
        avatarIdentifier: action.avatarIdentifier,
        sync: action.sync
      })

    case 'didLogin':
      if (action.save) {
        return state.merge({
          avatarIdentifier: action.avatarIdentifier
        })
      } else { // Anonym
        return state.merge({
          avatarIdentifier: action.avatarIdentifier,
          anonymAvatarData: Immutable.Map({
            grid: action.grid.name,
            name: action.name.getFullName(),
            avatarIdentifier: action.avatarIdentifier,
            dataSaveId: action.dataSaveId
          })
        })
      }

    case 'loginDidFail':
      return state.merge({
        avatarIdentifier: '',
        sync: false
      })

    case 'ViewerAccountLogInStatus':
      return state.merge({
        unlocked: action.isUnlocked == null ? state.get('unlocked') : action.isUnlocked,
        loggedIn: action.isLoggedIn,
        username: action.username
      })

    case 'ViewerAccountSignOut':
      return getDefault()

    case 'ViewerAccountUnlocked':
      return state.merge({
        unlocked: true
      })

    case 'ShowSignInPopup':
      return state.mergeDeep({
        signInPopup: action.popup
      })

    case 'ShowSignOutPopup':
      return state.mergeDeep({
        signInPopup: 'signOut'
      })

    case 'SHOW_PASSWORD_RESET':
      return state.mergeDeep({
        signInPopup: 'resetPassword',
        popupData: action.passwordType
      })

    case 'DISPLAY_VIEWER_ACCOUNT_RESET_KEYS':
      return state.mergeDeep({
        signInPopup: 'resetKeys',
        popupData: action.resetKeys
      })

    case 'ClosePopup':
      return state.mergeDeep({
        signInPopup: '',
        popupData: null
      })

    case 'AvatarSaved':
      return state.set('savedAvatars',
        state.get('savedAvatars').push(
          Immutable.Map(action.avatar)
        )
      )

    case 'AvatarsLoaded':
      const savedAvatars = Immutable.fromJS(action.avatars)
      return state.merge({
        savedAvatars,
        savedAvatarsLoaded: true
      })

    case 'SavedAvatarUpdated':
      return state.set('savedAvatars', state.get('savedAvatars').map(avatar => {
        return avatar.get('_id') === action.avatar._id ? Immutable.fromJS(action.avatar) : avatar
      }))

    case 'SavedAvatarRemoved':
      return state.set('savedAvatars', state.get('savedAvatars').filter(avatar => {
        return avatar.get('_id') !== action.avatar._id
      }))

    case 'GridAdded':
      const grids = state.get('savedGrids').push(Immutable.Map(action.grid))
      return state.set('savedGrids', grids)

    case 'GridsLoaded':
      const loadedGrids = Immutable.fromJS(action.grids)
      return state.merge({
        savedGrids: state.get('savedGrids').concat(loadedGrids),
        savedGridsLoaded: true
      })

    case 'SavedGridDidChanged':
      return state.set('savedGrids', state.get('savedGrids').map(grid => {
        if (grid.has('_id')) { // If grid has an id
          return grid.get('_id') === action.grid._id
            ? Immutable.fromJS(action.grid)
            : grid
        } else {
          return grid.get('name') === action.grid.name
            ? Immutable.fromJS(action.grid)
            : grid
        }
      }))

    case 'SavedGridRemoved':
      return state.set('savedGrids', state.get('savedGrids').filter(grid => {
        return grid.has('_id')
          ? grid.get('_id') !== action.grid._id // grid has an id
          : grid.get('name') !== action.grid.name
      }))

    case 'DidLogout':
    case 'UserWasKicked':
      return state.merge({
        avatarIdentifier: '',
        anonymAvatarData: null,
        sync: false
      })

    default:
      return state
  }
}
