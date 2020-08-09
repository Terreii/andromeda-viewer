// Everything for the viewer account

import { v4 as uuid } from 'uuid'

import {
  signInStatus,
  signOut as accountDidSignOut,
  unlocked,
  displayResetKeys,
  didUpdate as accountDidUpdate,
  avatarSaved,
  avatarsLoaded,
  savedAvatarUpdated,
  savedAvatarRemoved,
  gridAdded,
  gridsLoaded,
  savedGridDidChanged,
  savedGridRemoved,

  selectIsSignedIn,
  selectIsUnlocked,
  selectSavedAvatars,
  selectSavedAvatarsAreLoaded,
  selectSavedGrids,
  selectSavedGridsAreLoaded
} from '../bundles/account'
import { selectIsLoggedIn } from '../bundles/session'
import {
  createLocalDB,
  createCryptoStore,
  createRemoteDB,
  getUserDatabaseName,
  startSyncing
} from '../store/db'

import { IMChatType } from '../types/chat'

export function saveAvatar (name, agentId, grid) {
  return (dispatch, getState, { hoodie }) => {
    const gridName = typeof grid === 'string' ? grid : grid.name

    const avatarIdentifier = `${agentId}@${gridName}`

    if (selectSavedAvatars(getState()).some(avatar => {
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

    if (!selectIsSignedIn(activeState)) {
      throw new Error('Not signed in to Viewer!')
    }

    if (selectSavedAvatarsAreLoaded(activeState)) return

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

    dispatch(avatarsLoaded(avatars))
  }
}

function avatarsDidChange (type, doc) {
  switch (type) {
    case 'add':
      return avatarSaved(doc)
    case 'update':
      return savedAvatarUpdated(doc)
    case 'remove':
      return savedAvatarRemoved(doc)
    default:
      return () => {} // Do nothing
  }
}

export function saveGrid (newGrid) {
  return (dispatch, getState, { hoodie }) => {
    const name = newGrid.name.trim()

    if (selectSavedGrids(getState()).some(grid => grid.name === name)) {
      return Promise.reject(new Error('Grid already exist!'))
    }

    return hoodie.cryptoStore.withIdPrefix('grids/').add({
      name,
      loginURL: newGrid.loginURL,
      isLLSDLogin: false
    })
  }
}

export function loadSavedGrids () {
  return async (dispatch, getState, { hoodie }) => {
    const activeState = getState()

    if (!selectIsSignedIn(activeState)) {
      throw new Error('Not signed in to Viewer!')
    }

    if (selectSavedGridsAreLoaded(activeState)) return

    const gridsStore = hoodie.cryptoStore.withIdPrefix('grids/')

    const changeHandler = (change, doc) => {
      dispatch(gridsDidChange(change, doc))
    }

    gridsStore.on('change', changeHandler)
    hoodie.account.one('signout', () => {
      gridsStore.off('change', changeHandler)
    })

    const grids = await gridsStore.findAll()
    dispatch(gridsLoaded(grids))
  }
}

function gridsDidChange (type, grid) {
  switch (type) {
    case 'add':
      return gridAdded(grid)
    case 'update':
      return savedGridDidChanged(grid)
    case 'remove':
      return savedGridRemoved(grid)
    default:
      return () => {} // Do nothing
  }
}

export function isSignedIn () {
  return async (dispatch, getState, args) => {
    const session = await args.remoteDB.getSession()
    let username = session.userCtx.name

    if (username == null) {
      try {
        const userDoc = await args.db.get('_local/account')
        username = userDoc.name
      } catch (err) {
        if (err.status === 404) {
          username = null
        } else {
          throw err
        }
      }
    }

    const isLoggedIn = username != null

    if (isLoggedIn) {
      const userDbName = getUserDatabaseName(username)
      args.remoteDB = createRemoteDB(userDbName)

      startSyncing(args.db, args.remoteDB)

      if (process.env.NODE_ENV !== 'production') {
        window.remoteDB = args.remoteDB
      }
    }

    dispatch(signInStatus(isLoggedIn, null, username))

    return isLoggedIn
  }
}

// eslint-disable-next-line
function listenToAccountChanges (account, dispatch) {
  const handler = changes => {
    dispatch(accountDidUpdate(changes))
  }
  account.on('update', handler)
  account.one('signout', () => {
    account.off('update', handler)
  })
}

export function unlock (cryptoPassword) {
  return async (dispatch, getState, { hoodie }) => {
    const activeState = getState()
    if (selectIsUnlocked(activeState)) {
      return
    }

    if (!selectIsSignedIn(activeState)) {
      throw new Error('Not signed in!')
    }

    await hoodie.cryptoStore.unlock(cryptoPassword)

    dispatch(unlocked())

    await dispatch(loadSavedGrids())
    await dispatch(loadSavedAvatars())
  }
}

export function signIn (username, password, cryptoPassword) {
  return async (dispatch, getState, args) => {
    try {
      const accountProperties = await args.remoteDB.logIn(username, password)

      const userDbName = getUserDatabaseName(accountProperties.name)
      args.remoteDB = createRemoteDB(userDbName, false)

      startSyncing(args.db, args.remoteDB)

      if (process.env.NODE_ENV !== 'production') {
        window.remoteDB = args.remoteDB
      }

      await args.cryptoStore.unlock(cryptoPassword)
      await args.db.put({
        _id: '_local/account',
        name: accountProperties.name
      })

      dispatch(signInStatus(true, true, accountProperties.username))

      await dispatch(loadSavedGrids())
      dispatch(loadSavedAvatars())
    } catch (err) {
      console.error(err)

      if (err.name === 'unauthorized' || err.name === 'forbidden') {
        // name or password incorrect
        throw new Error('Username or password is wrong!')
      }
    }
  }
}

export function signUp (username, password, cryptoPassword) {
  return async (dispatch, getState, { cryptoStore, remoteDB }) => {
    try {
      const result = await remoteDB.signUp(username, password)
      const dbName = getUserDatabaseName(result.id.replace('org.couchdb.user:', ''))
      createRemoteDB(dbName, false)
      await cryptoStore.setup(cryptoPassword)

      await dispatch(
        signIn(username, password, cryptoPassword)
      )
    } catch (err) {
      if (err && err.name === 'conflict') {
        // already exists
      } else if (err.name === 'forbidden') {
        // invalid username
      } else {
        console.error(err)
      }
    }
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

  const shouldUpdateUsername = nextUsername != null && nextUsername.length > 0
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

    dispatch(unlocked())

    dispatch(displayResetKeys(result.resetKeys))

    await dispatch(loadSavedGrids())
    dispatch(loadSavedAvatars())
  }
}

export function signOut () {
  return async (dispatch, getState, args) => {
    await dispatch(logoutAvatar())

    try {
      await args.remoteDB.logOut()
      await args.db.destroy()
      args.cryptoStore.lock()

      dispatch(accountDidSignOut())

      args.db = createLocalDB()
      args.remoteDB = createRemoteDB('_users')
      args.cryptoStore = createCryptoStore(args.db)

      if (process.env.NODE_ENV !== 'production') {
        window.localDB = args.db
        window.remoteDB = args.remoteDB
        window.cryptoStore = args.cryptoStore
      }
    } catch (err) {
      console.error(err)
    }
  }
}

/**
 * Fetch all data of the user and process it into a formated JSON (row data)
 * and Second Life viewers files format.
 * @returns {object} JSON data and array of files (text).
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

    const raw = {
      account,
      profile,
      grids,
      avatars: avatarData
    }

    const files = avatarData.flatMap(generateExportFiles)

    return { raw, files }
  }
}

function generateExportFiles (avatar) {
  const avatarPart = avatar.info.name.toLowerCase().replace(/\s/, '_')
  const gridPart = avatar.info.grid === 'Second Life'
    ? ''
    : `.${avatar.info.grid.toLowerCase()}`
  const folderName = `${avatarPart}${gridPart}/`

  const avatarFiles = []
  let conversationLog = ''

  for (const chat of avatar.imChats) {
    const name = chat.info.chatType === 'personal'
      ? chat.info.name.toLowerCase().replace(/\s/, '_')
      : chat.info.name

    const messagesCount = chat.messages.length
    if (messagesCount === 0) {
      continue
    }

    // generate im chat log
    avatarFiles.push({
      name: `${folderName}${name}.txt`,
      data: chat.messages.reduce(reduceExportChatLines, '')
    })

    // generate line in conversation.log
    const time = Math.floor(chat.messages[messagesCount - 1].time / 1000)

    const typeNum = IMChatType[chat.info.chatType]
    const hasOffline = 0 // does it have offline messages?

    const display = chat.info.name
    const targetId = chat.info.target
    const chatId = chat.info.sessionId

    const file = encodeURI(name)

    const line = `[${time}] ${typeNum} 0 ${hasOffline} ${display}| ${targetId} ${chatId} ${file}|\n`
    conversationLog += line
  }

  avatarFiles.push({
    name: folderName + 'conversation.log',
    data: conversationLog
  })

  avatarFiles.push({
    name: folderName + 'chat.txt',
    data: avatar.localChat.reduce(reduceExportChatLines, '')
  })

  return avatarFiles
}

function reduceExportChatLines (file, line) {
  const time = new Date(line.time)
  const year = time.getFullYear()
  const month = time.getMonth().toString().padStart(2, '0')
  const day = time.getDate().toString().padStart(2, '0')
  const hours = time.getHours().toString().padStart(2, '0')
  const min = time.getMinutes().toString().padStart(2, '0')

  return `${file}[${year}/${month}/${day} ${hours}:${min}]  ${line.fromName}: ${line.message}\n`
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
    if (selectIsLoggedIn(getState())) {
      const { logout } = await import('./sessionActions')
      await dispatch(logout())
    }
  }
}
