'use strict'

import { logout } from '../session'

export function didSignIn (did, username = '') {
  const isLoggedIn = Boolean(did)
  return {
    type: 'ViewerAccountLogInStatus',
    isLoggedIn,
    username: isLoggedIn ? username : ''
  }
}

export function showSignInPopup (popup = 'signIn') {
  return {
    type: 'ShowSignInPopup',
    popup
  }
}

export function showSignOutPopup () {
  return {
    type: 'ShowSignOutPopup'
  }
}

export function closePopup () {
  return {
    type: 'ClosePopup'
  }
}

export function isSignedIn () {
  return (dispatch, getState, hoodie) => {
    hoodie.account.get(['session', 'username']).then(properties => {
      const isLoggedIn = properties.session != null
      const action = didSignIn(isLoggedIn, properties.username)
      dispatch(action)
    })
  }
}

export function signIn (username, password) {
  return (dispatch, getState, hoodie) => {
    dispatch(closePopup())
    return hoodie.account.signIn({username, password}).then(accountProperties => {
      dispatch(didSignIn(true, accountProperties.username))
    }).catch(err => {
      dispatch(didSignIn(false))
      console.error(err)
    })
  }
}

export function signUp (username, password) {
  return (dispatch, getState, hoodie) => {
    dispatch(closePopup())
    return hoodie.account.signUp({username, password}).then(accountProperties => {
      dispatch(signIn(username, password))
    })
  }
}

export function signOut () {
  return (dispatch, getState, hoodie) => {
    dispatch(closePopup())
    if (getState().account.get('loggedIn')) {
      logout()
    }
    return hoodie.account.signOut().then(sessionProperties => {
      dispatch(didSignIn(false))
    }).catch(err => {
      console.error(err)
    })
  }
}
