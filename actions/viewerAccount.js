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

export function saveAvatar (name, grid) {
  return (dispatch, getState, hoodie) => {
    if (!getState().account.getIn(['viewerAccount', 'loggedIn'])) return

    const avatarIdentifier = `${name.getFullName()}@${grid.name}`
    if (getState().account.get('avatars').some(avatar => {
      return avatar.get('_id').endsWith(avatarIdentifier)
    })) {
      dispatch({
        type: 'AvatarNotAdded'
      })
    }

    dispatch({
      type: 'SavingAvatar',
      name
    })

    hoodie.store.add({
      _id: 'avatars/' + avatarIdentifier,
      name: name.getFullName(),
      grid: grid.name
    }).then(doc => {
      dispatch({
        type: 'AvatarSaved',
        avatar: doc
      })
    })
  }
}

export function loadSavedAvatars () {
  return (dispatch, getState, hoodie) => {
    if (!getState().account.getIn(['viewerAccount', 'loggedIn'])) {
      return Promise.reject(new Error('Not signed in to Viewer!'))
    }

    return hoodie.store.withIdPrefix('avatars/').findAll().then(avatars => {
      dispatch({
        type: 'AvatarsLoaded',
        avatars
      })
    })
  }
}

export function saveGrid (name, loginURL) {
  name = name.trim()
  return (dispatch, getState, hoodie) => {
    if (getState().account.get('savedGrids').some(value => value.get('name') === name)) return

    if (!getState().account.getIn(['viewerAccount', 'loggedIn'])) {
      dispatch({
        type: 'GridAdded',
        name,
        loginURL
      })
      return Promise.resolve()
    }

    hoodie.store.add({
      _id: 'grids/' + name,
      name,
      loginURL
    }).then(doc => {
      dispatch({
        type: 'GridAdded',
        name,
        loginURL
      })
    })
  }
}

export function loadSavedGrids () {
  return (dispatch, getState, hoodie) => {
    if (!getState().account.getIn(['viewerAccount', 'loggedIn'])) {
      return Promise.reject(new Error('Not signed in to Viewer!'))
    }

    return hoodie.store.withIdPrefix('grids/').findAll().then(grids => {
      dispatch({
        type: 'GridsLoaded',
        grids
      })
    })
  }
}

export function isSignedIn () {
  return (dispatch, getState, hoodie) => {
    return hoodie.account.get(['session', 'username']).then(properties => {
      const isLoggedIn = properties.session != null
      const action = didSignIn(isLoggedIn, properties != null ? properties.username : undefined)
      dispatch(action)
      return isLoggedIn
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
