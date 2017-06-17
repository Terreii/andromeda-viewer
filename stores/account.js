'use strict'

import Immutable from 'immutable'

function getDefault () {
  const defaultData = {
    avatarName: '',
    loggedIn: false,
    sync: false,
    viewerAccount: {
      loggedIn: false,
      username: '',
      signInPopup: ''
    }
  }
  return Immutable.fromJS(defaultData)
}

export default function accountStore (state = getDefault(), action) {
  switch (action.type) {
    case 'didLogin':
      return state.merge({
        avatarName: action.name.getName(),
        loggedIn: true
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
    default:
      return state
  }
}
