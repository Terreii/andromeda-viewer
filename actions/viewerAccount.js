'use strict'

export function didLogIn (did, username = '') {
  const isLoggedIn = Boolean(did)
  return {
    type: 'ViewerAccountLogInStatus',
    isLoggedIn,
    username: isLoggedIn ? username : ''
  }
}
