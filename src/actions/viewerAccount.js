// Everything for the viewer account

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

export function closePopup () {
  return {
    type: 'ClosePopup'
  }
}

export function saveAvatar (name, grid) {
  return (dispatch, getState, { hoodie }) => {
    if (!getState().account.getIn(['viewerAccount', 'loggedIn'])) return

    const avatarIdentifier = `${name.getFullName()}@${grid.get('name')}`
    if (getState().account.get('savedAvatars').some(avatar => {
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
    })
  }
}

export function loadSavedAvatars () {
  return async (dispatch, getState, extra) => {
    const account = getState().account

    if (!account.getIn(['viewerAccount', 'loggedIn'])) {
      throw new Error('Not signed in to Viewer!')
    }

    if (account.get('savedAvatarsLoaded')) return

    const avatarsStore = extra.hoodie.store.withIdPrefix('avatars/')

    const changeHandler = (eventName, doc) => {
      dispatch(avatarsDidChange(eventName, doc))
    }

    avatarsStore.on('change', changeHandler)
    extra.handlers.push({
      type: 'change',
      handler: changeHandler
    })

    const avatars = await avatarsStore.findAll()
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

export function saveGrid (name, loginURL) {
  name = name.trim()
  return (dispatch, getState, { hoodie }) => {
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
    })
  }
}

export function loadSavedGrids () {
  return async (dispatch, getState, extra) => {
    const account = getState().account

    if (!account.getIn(['viewerAccount', 'loggedIn'])) {
      throw new Error('Not signed in to Viewer!')
    }

    if (account.get('savedGridsLoaded')) return

    const gridsStore = extra.hoodie.store.withIdPrefix('grids/')

    const changeHandler = (change, doc) => {
      dispatch(gridsDidChange(change, doc))
    }

    gridsStore.on('change', changeHandler)
    extra.handlers.push({
      type: 'change',
      handler: changeHandler
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

export function unlock (password) {
  return async (dispatch, getState, { hoodie }) => {
    const activeState = getState()
    if (activeState.account.get('unlocked')) {
      return
    }

    if (!activeState.account.getIn(['viewerAccount', 'loggedIn'])) {
      throw new Error('Not signed in!')
    }

    await hoodie.store.sync()
    await hoodie.cryptoStore.setPassword(password)

    dispatch({
      type: 'ViewerAccountUnlocked'
    })

    await dispatch(loadSavedGrids())
    dispatch(loadSavedAvatars())
  }
}

export function signIn (username, password) {
  return async (dispatch, getState, { hoodie }) => {
    dispatch(closePopup())
    try {
      const accountProperties = await hoodie.account.signIn({ username, password })
      await hoodie.store.sync()
      await hoodie.cryptoStore.setPassword(password)
      dispatch(didSignIn(true, true, accountProperties.username))

      await dispatch(loadSavedGrids())
      dispatch(loadSavedAvatars())
    } catch (err) {
      dispatch(didSignIn(false))
      console.error(err)
    }
  }
}

export function signUp (username, password) {
  return async (dispatch, getState, { hoodie }) => {
    dispatch(closePopup())
    await hoodie.account.signUp({ username, password })
    dispatch(signIn(username, password))
  }
}

export function signOut () {
  return (dispatch, getState, extra) => {
    dispatch(closePopup())
    if (getState().account.get('loggedIn')) {
      // logout() TODO: log out if sign out
    }
    const hoodie = extra.hoodie

    return hoodie.account.signOut().then(sessionProperties => {
      extra.handlers.forEach(handler => { // unsubscribe to events from hoodie
        hoodie.store.off(handler.type, handler.handler)
      })
      extra.handlers = []

      dispatch({
        type: 'ViewerAccountSignOut'
      })
    }).catch(err => {
      console.error(err)
    })
  }
}
