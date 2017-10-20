'use strict'

import Immutable from 'immutable'

function getDefault () {
  const defaultData = {
    avatarName: '',
    loggedIn: false,
    sync: false,
    agentId: '',
    viewerAccount: {
      loggedIn: false,
      username: '',
      signInPopup: ''
    },
    savedAvatars: [],
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
    ]
  }
  return Immutable.fromJS(defaultData)
}

export default function accountStore (state = getDefault(), action) {
  switch (action.type) {
    case 'didLogin':
      return state.merge({
        avatarName: action.name,
        loggedIn: true,
        agentId: action.uuid
      })
    case 'ViewerAccountLogInStatus':
      return state.mergeDeep({
        viewerAccount: {
          loggedIn: action.isLoggedIn,
          username: action.username
        }
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
    case 'AvatarSaved':
      return state.set('savedAvatars',
        state.get('savedAvatars').push(
          Immutable.Map(action.avatar)
        )
      )
    case 'AvatarsLoaded':
      const savedAvatars = Immutable.fromJS(action.avatars)
      return state.set('savedAvatars', savedAvatars)
    case 'GridAdded':
      const grids = state.get('savedGrids').push(Immutable.Map({
        name: action.name,
        loginURL: action.loginURL
      }))
      return state.set('savedGrids', grids)
    case 'GridsLoaded':
      const loadedGrids = action.grids.map(grid => Immutable.Map({
        name: grid.name,
        loginURL: grid.loginURL
      }))
      return state.set('savedGrids', state.get('savedGrids').concat(loadedGrids))
    default:
      return state
  }
}
