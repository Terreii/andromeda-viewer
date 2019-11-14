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

export function saveAvatar (name, agentId, grid) {
  return (dispatch, getState, { hoodie }) => {
    const gridName = typeof grid === 'string' ? grid : grid.name

    const avatarIdentifier = `${agentId}@${gridName}`

    if (getSavedAvatars(getState()).some(avatar => {
      return avatar.avatarIdentifier === avatarIdentifier
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

    if (getSavedGrids(getState()).some(grid => grid.name === name)) {
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

function accountDidUpdate (changes) {
  return {
    type: 'VIEWER_ACCOUNT_DID_UPDATE',
    changes
  }
}

export function isSignedIn () {
  return async (dispatch, getState, { hoodie }) => {
    const properties = await hoodie.account.get(['session', 'username'])
    const isLoggedIn = properties.session != null
    const username = properties != null ? properties.username : undefined
    const action = didSignIn(isLoggedIn, null, username)
    dispatch(action)

    hoodie.account.on('update', changes => { dispatch(accountDidUpdate(changes)) })

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
 * Update the Viewer Account (using hoodie).
 * @param {object} options Object containing optional params.
 * @param {string?} options.nextUsername If the username should be updated, then this is it.
 * @param {string?} options.password If the password should be updated, then this is the
 *                                   current password
 * @param {string?} options.nextPassword If the password should be updated, then this is the new one
 */
export function updateAccount ({ nextUsername, password, nextPassword }) {
  const mailReg = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i

  const shouldUpdateUsername = nextUsername.length > 0
  const shouldUpdatePassword = password != null && password.length > 0 &&
    nextPassword != null && nextPassword.length > 0

  return async (dispatch, getState, { hoodie }) => {
    if (shouldUpdateUsername && !mailReg.test(nextUsername)) {
      throw new TypeError('Username must be a valid e-mail address!')
    }
    if (shouldUpdatePassword && nextPassword.length < 8) {
      throw new Error('Password must have 8 characters or more!')
    }

    const username = await hoodie.account.get('username')

    const options = {
      username: shouldUpdateUsername ? nextUsername : username
    }

    // check if old password is correct
    if (shouldUpdatePassword) {
      await hoodie.account.signIn({ username, password }) // will reject if password is wrong

      options.password = nextPassword
    }

    return hoodie.account.update(options)
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
    await dispatch(logoutAvatar())

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

/**
 * Fetch all data of the user and process it into a formated JSON (row data).
 * @returns {object} JSON data.
 */
export function downloadAccountData () {
  return async (dispatch, getState, { hoodie }) => {
    const allAvatars = await hoodie.cryptoStore.withIdPrefix('avatars/').findAll()

    const avatarData = await Promise.all(allAvatars.map(async avatar => {
      const avatarStore = hoodie.cryptoStore.withIdPrefix(avatar.dataSaveId + '/')

      const [localChat, imChatsInfos] = await Promise.all([
        avatarStore.withIdPrefix('localchat').findAll(),
        avatarStore.withIdPrefix('imChatsInfos/').findAll()
      ])

      const imChats = await Promise.all(imChatsInfos.map(async info => {
        return {
          info,
          messages: await avatarStore.withIdPrefix(`imChats/${info.saveId}`).findAll()
        }
      }))

      return {
        info: avatar,
        localChat,
        imChats
      }
    }))

    // Get other data
    const [grids, account, profile] = await Promise.all([
      hoodie.cryptoStore.withIdPrefix('grids/').findAll(),
      hoodie.account.get(),
      hoodie.account.profile.get()
    ])

    return {
      account,
      profile,
      grids,
      avatars: avatarData
    }
  }
}

export function deleteAccount () {
  return async (dispatch, getState, { hoodie }) => {
    await dispatch(logoutAvatar())

    const results = await hoodie.account.destroy()
    dispatch({ type: 'ViewerAccountSignOut', results })
  }
}

/**
 * Logout an avatar if one is still logged in.
 */
function logoutAvatar () {
  return async (dispatch, getState) => {
    if (getIsLoggedIn(getState())) {
      const { logout } = await import('./sessionActions')
      await dispatch(logout())
    }
  }
}
