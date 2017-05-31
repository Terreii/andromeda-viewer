'use strict'

export function didLogIn (did, username = '') {
  const isLoggedIn = Boolean(did)
  return {
    type: 'ViewerAccountLogInStatus',
    isLoggedIn,
    username: isLoggedIn ? username : ''
  }
}

export function showSignInPopup () {
  return {
    type: 'ShowSignInPopup'
  }
}

export function closePopup () {
  return {
    type: 'ClosePopup'
  }
}
