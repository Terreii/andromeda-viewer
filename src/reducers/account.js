import Immutable from 'immutable'

function getDefault () {
  const defaultData = {
    avatarName: '',
    loggedIn: false,
    avatarIdentifier: '',
    sync: false,
    unlocked: false,
    agentId: '',
    viewerAccount: {
      loggedIn: false,
      username: '',
      signInPopup: ''
    },
    savedAvatars: [],
    savedAvatarsLoaded: false,
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
    case 'didLogin':
      return state.merge({
        avatarName: action.name,
        loggedIn: true,
        avatarIdentifier: action.avatarIdentifier,
        agentId: action.uuid
      })

    case 'ViewerAccountLogInStatus':
      return state.mergeDeep({
        unlocked: action.isUnlocked == null ? state.get('unlocked') : action.isUnlocked,
        viewerAccount: {
          loggedIn: action.isLoggedIn,
          username: action.username
        }
      })

    case 'ViewerAccountUnlocked':
      return state.merge({
        unlocked: true
      })

    case 'ShowSignInPopup':
      return state.mergeDeep({
        viewerAccount: {
          signInPopup: action.popup
        }
      })

    case 'ShowSignOutPopup':
      return state.mergeDeep({
        viewerAccount: {
          signInPopup: 'signOut'
        }
      })

    case 'ClosePopup':
      return state.mergeDeep({
        viewerAccount: {
          signInPopup: ''
        }
      })

    case 'SavingAvatar':
      return state.set('sync', true)

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
        avatarName: '',
        loggedIn: false,
        avatarIdentifier: '',
        sync: false,
        agentId: ''
      })

    default:
      return state
  }
}
