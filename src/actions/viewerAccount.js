// Everything for the viewer account

import { v4 as uuid } from 'uuid'

import {
  getIsSignedIn,
  getIsUnlocked,
  getSavedAvatars,
  getSavedAvatarsAreLoaded,
  getSavedGrids,
  getSavedGridsAreLoaded
} from '../selectors/viewer'
import { getIsLoggedIn } from '../selectors/session'

export function didSignIn (did, isUnlocked, username = '') {
  const isLoggedIn = Boolean(did)
  return {
    type: 'ViewerAccountLogInStatus',
    isLoggedIn,
    isUnlocked,
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

export function showResetPassword (type) {
  return {
    type: 'SHOW_PASSWORD_RESET',
    passwordType: type
  }
}

function showResetKeys (resetKeys) {
  return {
    type: 'DISPLAY_VIEWER_ACCOUNT_RESET_KEYS',
    resetKeys
  }
}

export function closePopup () {
  return {
    type: 'ClosePopup'
  }
}

export function saveAvatar (name, grid) {
  return (dispatch, getState, { hoodie }) => {
    const gridName = typeof grid === 'string' ? grid : grid.get('name')

    const avatarIdentifier = `${name.getFullName()}@${gridName}`

    if (getSavedAvatars(getState()).some(avatar => {
      return avatar.get('avatarIdentifier') === avatarIdentifier
    })) {
      return Promise.reject(new Error('Avatar already exist!'))
    }

    return hoodie.cryptoStore.withIdPrefix('avatars/').add({
      dataSaveId: uuid(),
      avatarIdentifier,
      name: name.getFullName(),
      grid: gridName
    })
  }
}

export function loadSavedAvatars () {
  return async (dispatch, getState, { hoodie }) => {
    const activeState = getState()

    if (!getIsSignedIn(activeState)) {
      throw new Error('Not signed in to Viewer!')
    }

    if (getSavedAvatarsAreLoaded(activeState)) return

    const avatarsStore = hoodie.cryptoStore.withIdPrefix('avatars/')

    const changeHandler = (eventName, doc) => {
      dispatch(avatarsDidChange(eventName, doc))
    }

    avatarsStore.on('change', changeHandler)
    hoodie.account.one('signout', () => {
      avatarsStore.off('change', changeHandler)
    })

    const avatars = await avatarsStore.findAll()

    avatars.sort((a, b) => {
      const aDate = a.hoodie.createdAt
      const bDate = b.hoodie.createdAt

      if (aDate > bDate) return 1
      if (aDate < bDate) return -1
      return 0
    })

    dispatch({
      type: 'AvatarsLoaded',
      avatars
    })
  }
}

function avatarsDidChange (type, doc) {
  switch (type) {
    case 'add':
      return {
        type: 'AvatarSaved',
        avatar: doc
      }
    case 'update':
      return {
        type: 'SavedAvatarUpdated',
        avatar: doc
      }
    case 'remove':
      return {
        type: 'SavedAvatarRemoved',
        avatar: doc
      }
    default:
      return () => {} // Do nothing
  }
}

export function saveGrid (newGrid) {
  return (dispatch, getState, { hoodie }) => {
    const name = newGrid.name.trim()

    if (getSavedGrids(getState()).some(grid => grid.get('name') === name)) {
      return Promise.reject(new Error('Grid already exist!'))
    }

    return hoodie.cryptoStore.withIdPrefix('grids/').add({
      name,
      loginURL: newGrid.url
    })
  }
}

export function loadSavedGrids () {
  return async (dispatch, getState, { hoodie }) => {
    const activeState = getState()

    if (!getIsSignedIn(activeState)) {
      throw new Error('Not signed in to Viewer!')
    }

    if (getSavedGridsAreLoaded(activeState)) return

    const gridsStore = hoodie.cryptoStore.withIdPrefix('grids/')

    const changeHandler = (change, doc) => {
      dispatch(gridsDidChange(change, doc))
    }

    gridsStore.on('change', changeHandler)
    hoodie.account.one('signout', () => {
      gridsStore.off('change', changeHandler)
    })

    const grids = await gridsStore.findAll()
    dispatch({
      type: 'GridsLoaded',
      grids
    })
  }
}

function gridsDidChange (type, grid) {
  switch (type) {
    case 'add':
      return {
        type: 'GridAdded',
        grid
      }
    case 'update':
      return {
        type: 'SavedGridDidChanged',
        grid
      }
    case 'remove':
      return {
        type: 'SavedGridRemoved',
        grid
      }
    default:
      return () => {} // Do nothing
  }
}

export function isSignedIn () {
  return async (dispatch, getState, { hoodie }) => {
    const properties = await hoodie.account.get(['session', 'username'])
    const isLoggedIn = properties.session != null
    const username = properties != null ? properties.username : undefined
    const action = didSignIn(isLoggedIn, null, username)
    dispatch(action)
    return isLoggedIn
  }
}

export function unlock (cryptoPassword) {
  return async (dispatch, getState, { hoodie }) => {
    const activeState = getState()
    if (getIsUnlocked(activeState)) {
      return
    }

    if (!getIsSignedIn(activeState)) {
      throw new Error('Not signed in!')
    }

    await hoodie.cryptoStore.unlock(cryptoPassword)

    dispatch({
      type: 'ViewerAccountUnlocked'
    })

    await dispatch(loadSavedGrids())
    dispatch(loadSavedAvatars())
  }
}

export function signIn (username, password, cryptoPassword) {
  return async (dispatch, getState, { hoodie }) => {
    try {
      const accountProperties = await hoodie.account.signIn({ username, password })
      await hoodie.cryptoStore.unlock(cryptoPassword)

      dispatch(closePopup())
      dispatch(didSignIn(true, true, accountProperties.username))

      await dispatch(loadSavedGrids())
      dispatch(loadSavedAvatars())
    } catch (err) {
      console.error(err)

      // if the cryptoPassword is wrong, but the user password right
      const properties = await hoodie.account.get(['session', 'username'])
      const signedIn = properties.session != null
      if (signedIn) {
        await hoodie.account.signOut()
        throw new Error('Encryption password is wrong!')
      }
      throw new Error('Username or password is wrong!')
    }
  }
}

export function signUp (username, password, cryptoPassword) {
  return async (dispatch, getState, { hoodie }) => {
    await hoodie.account.signUp({ username, password })
    const resetKeys = await hoodie.cryptoStore.setup(cryptoPassword)

    await dispatch(
      signIn(username, password, cryptoPassword)
    )

    dispatch(showResetKeys(resetKeys))
  }
}

/**
 * Changes the encryption-password and unlocks the viewer.
 * @param {string} resetKey One of the 10 reset-keys
 * @param {string} newPassword The new encryption password
 * @throws Will throw an error if the reset-key is wrong.
 */
export function changeEncryptionPassword (resetKey, newPassword) {
  return async (dispatch, getState, { hoodie }) => {
    await hoodie.store.sync()
    const result = await hoodie.cryptoStore.resetPassword(resetKey, newPassword)

    dispatch({
      type: 'ViewerAccountUnlocked'
    })
    dispatch(closePopup())

    dispatch(showResetKeys(result.resetKeys))

    await dispatch(loadSavedGrids())
    dispatch(loadSavedAvatars())
  }
}

export function signOut () {
  return async (dispatch, getState, { hoodie }) => {
    dispatch(closePopup())
    if (getIsLoggedIn(getState())) {
      // logout if an avatar is still logged in
      const { logout } = await import('./sessionActions')
      await dispatch(logout())
    }

    try {
      await hoodie.account.signOut()

      dispatch({
        type: 'ViewerAccountSignOut'
      })
    } catch (err) {
      console.error(err)
    }
  }
}
