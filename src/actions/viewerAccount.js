// Everything for the viewer account

import { v4 as uuid } from 'uuid'

import {
  signInStatus,
  signOut as accountDidSignOut,
  unlocked,
  didUpdateUsername,
  displayResetKeys,
  avatarSaved,
  avatarsLoaded,
  savedAvatarUpdated,
  savedAvatarRemoved,
  gridAdded,
  gridsLoaded,
  savedGridDidChanged,
  savedGridRemoved,

  selectIsSignedIn,
  selectUserName,
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
  return (dispatch, getState, { cryptoStore }) => {
    const gridName = typeof grid === 'string' ? grid : grid.name

    const avatarIdentifier = `${agentId}@${gridName}`

    if (selectSavedAvatars(getState()).some(avatar => {
      return avatar.avatarIdentifier === avatarIdentifier
    })) {
      return Promise.reject(new Error('Avatar already exist!'))
    }

    return cryptoStore.withIdPrefix('avatars/').add({
      dataSaveId: uuid(),
      avatarIdentifier,
      name: name.getFullName(),
      grid: gridName
    })
  }
}

export function loadSavedAvatars () {
  return async (dispatch, getState, { db, cryptoStore }) => {
    const activeState = getState()

    if (!selectIsSignedIn(activeState)) {
      throw new Error('Not signed in to Viewer!')
    }

    if (selectSavedAvatarsAreLoaded(activeState)) return

    const avatarsStore = cryptoStore.withIdPrefix('avatars/')

    const changeHandler = (eventName, doc) => {
      dispatch(avatarsDidChange(eventName, doc))
    }

    avatarsStore.on('change', changeHandler)
    db.once('destroyed', () => {
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
  return (dispatch, getState, { cryptoStore }) => {
    const name = newGrid.name.trim()

    if (selectSavedGrids(getState()).some(grid => grid.name === name)) {
      return Promise.reject(new Error('Grid already exist!'))
    }

    return cryptoStore.withIdPrefix('grids/').add({
      name,
      loginURL: newGrid.loginURL,
      isLLSDLogin: false
    })
  }
}

export function loadSavedGrids () {
  return async (dispatch, getState, { db, cryptoStore }) => {
    const activeState = getState()

    if (!selectIsSignedIn(activeState)) {
      throw new Error('Not signed in to Viewer!')
    }

    if (selectSavedGridsAreLoaded(activeState)) return

    const gridsStore = cryptoStore.withIdPrefix('grids/')

    const changeHandler = (change, doc) => {
      dispatch(gridsDidChange(change, doc))
    }

    gridsStore.on('change', changeHandler)
    db.once('destroyed', () => {
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

/**
 * Get the users data.
 * @param {PouchDB.Database} db The local Database.
 * @returns {Promise<{ _id: string, _rev: string, accountId: string, name: string }>} Doc with user info
 */
async function getUserInfo (db) {
  const userDoc = await db.get('_local/account')
  return userDoc
}

export function isSignedIn () {
  return async (dispatch, getState, args) => {
    const session = await args.remoteDB.getSession()
    let username = session?.userCtx?.name

    if (username == null) {
      try {
        const userDoc = await getUserInfo(args.db)
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
      args.remoteDB.close()
      const { remote } = args.createDatabases({ remote: userDbName })
      args.remoteDB = remote
      args.cryptoStore = createCryptoStore(args.db, args.remoteDB)
    }

    dispatch(signInStatus(isLoggedIn, null, username))

    return isLoggedIn
  }
}

/**
 * Generate/derive the login and encryption passwords from one password and username.
 * Inspired by https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-client/lib/crypto.ts
 * @param {string} username User' name
 * @param {string} password User password
 */
async function derivePasswords (username, password) {
  const enc = new TextEncoder()
  const NAMESPACE = 'account.andromeda-viewer.com/v1/'
  const key = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const stretchedRaw = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode(`${NAMESPACE}quickStretch:${username}`),
      iterations: 100000,
      hash: 'SHA-512'
    },
    key,
    512
  )
  const stretchedKey = await window.crypto.subtle.importKey(
    'raw',
    stretchedRaw,
    'HKDF',
    false,
    ['deriveBits']
  )
  const authPW = await window.crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      salt: new Uint8Array(0),
      info: enc.encode(`${NAMESPACE}authPW`),
      hash: 'SHA-512'
    },
    stretchedKey,
    512
  )
  const toString = buffy => {
    return Array.from(new Uint8Array(buffy))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('')
  }
  return {
    loginPassword: toString(authPW.slice(0, 32)),
    cryptoPassword: toString(authPW.slice(32))
  }
}

export function unlock (password) {
  return async (dispatch, getState, args) => {
    const activeState = getState()
    if (selectIsUnlocked(activeState)) {
      return
    }

    if (!selectIsSignedIn(activeState)) {
      throw new Error('Not signed in!')
    }

    const username = selectUserName(activeState)
    const accountDoc = await getUserInfo(args.db)
    const { loginPassword, cryptoPassword } = await derivePasswords(username, password)
    await args.remoteDB.logIn(accountDoc.accountId, loginPassword)

    const userDbName = getUserDatabaseName(accountDoc.accountId)
    args.remoteDB.close()
    const { remote } = args.createDatabases({ remote: userDbName })
    args.remoteDB = remote

    startSyncing(args.db, args.remoteDB)

    await args.cryptoStore.unlock(cryptoPassword)

    dispatch(unlocked())

    await dispatch(loadSavedGrids())
    await dispatch(loadSavedAvatars())
  }
}

function signInAndSync (accountProperties, password, cryptoPassword) {
  return async (dispatch, getState, args) => {
    await args.remoteDB.logIn(accountProperties.data.id, password)

    const userDbName = getUserDatabaseName(accountProperties.data.id)
    args.remoteDB.close()
    const { remote } = args.createDatabases({ remote: userDbName, skipSetup: false })
    args.remoteDB = remote
    args.cryptoStore = createCryptoStore(args.db, args.remoteDB)

    startSyncing(args.db, args.remoteDB)

    await args.db.put({
      _id: '_local/account',
      accountId: accountProperties.data.id,
      name: accountProperties.data.attributes.username
    })
    await args.cryptoStore.unlock(cryptoPassword)

    dispatch(signInStatus(true, true, accountProperties.data.attributes.username))

    await dispatch(loadSavedGrids())
    await dispatch(loadSavedAvatars())
  }
}

export function signIn (username, password) {
  return async (dispatch, getState) => {
    if (selectIsSignedIn(getState())) return

    const { loginPassword, cryptoPassword } = await derivePasswords(username, password)
    const accountDataReq = await window.fetch('/api/account', {
      method: 'GET',
      headers: {
        Authorization: 'Basic ' + window.btoa(`${username}:${loginPassword}`),
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
    const accountProperties = await accountDataReq.json()
    if (accountProperties.error) {
      throw accountProperties.error[0]
    }
    await dispatch(signInAndSync(accountProperties, loginPassword, cryptoPassword))
  }
}

export function signUp (username, password) {
  return async (dispatch, getState, { cryptoStore }) => {
    if (selectIsSignedIn(getState())) return

    const { loginPassword, cryptoPassword } = await derivePasswords(username, password)

    const request = await window.fetch('/api/account', {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          type: 'account',
          attributes: {
            username,
            password: loginPassword
          }
        }
      })
    })
    const accountProperties = await request.json()
    if (accountProperties.error) {
      throw accountProperties.error[0]
    }
    const resetKeys = await cryptoStore.setup(cryptoPassword)
    dispatch(displayResetKeys(resetKeys))

    await dispatch(signInAndSync(accountProperties, loginPassword, cryptoPassword))
  }
}

/**
 * Update the Viewer Account.
 * @param {object} options Object containing optional params.
 * @param {string?} options.nextUsername If the username should be updated, then this is it.
 * @param {string} options.password      The current password. Always needed, for encryption.
 * @param {string?} options.nextPassword If the password should be updated, then this is the new one
 */
export function updateAccount ({ nextUsername, password, nextPassword }) {
  const mailReg = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i

  const shouldUpdateUsername = nextUsername != null && nextUsername.length > 0
  const shouldUpdatePassword = nextPassword != null && nextPassword.length > 0

  return async (dispatch, getState, { db, cryptoStore }) => {
    if (password == null || password.length < 8) {
      throw new TypeError('Please enter the current password!')
    }
    if (shouldUpdateUsername && !mailReg.test(nextUsername)) {
      throw new TypeError('Username must be a valid e-mail address!')
    }
    if (shouldUpdatePassword && nextPassword.length < 8) {
      throw new Error('Password must have 8 characters or more!')
    }

    const { name } = await getUserInfo(db)
    const updateName = shouldUpdateUsername ? nextUsername : undefined
    const { loginPassword, cryptoPassword } = await derivePasswords(name, password)
    const { loginPassword: nextLoginPw, cryptoPassword: nextCryptoPw } = await derivePasswords(
      updateName ?? name,
      shouldUpdatePassword ? nextPassword : password
    )

    const accountDataReq = await window.fetch('/api/account', {
      method: 'PATCH',
      headers: {
        Authorization: 'Basic ' + window.btoa(`${name}:${loginPassword}`),
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          type: 'account',
          attributes: {
            username: updateName,
            password: nextLoginPw
          }
        }
      })
    })
    const accountDataTxt = await accountDataReq.text()
    const accountData = accountDataTxt.length > 0 ? JSON.parse(accountDataTxt) : {}

    if (accountDataReq.ok && accountData.errors == null) {
      const result = await cryptoStore.changePassword(cryptoPassword, nextCryptoPw)

      dispatch(displayResetKeys(result.resetKeys))

      if (shouldUpdateUsername) {
        const userDoc = await getUserInfo(db)
        userDoc.name = nextUsername
        await db.put(userDoc)
        dispatch(didUpdateUsername({ username: nextUsername }))
      }
    } else if (accountData.errors) {
      const err = new Error(accountData.errors[0].title)
      err.name = accountData.errors[0].title
      err.message = accountData.errors[0].detail
      throw err
    } else {
      throw new Error('unknown')
    }
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
      await args.remoteDB.close()
      await args.db.destroy()
      args.cryptoStore.lock()

      dispatch(accountDidSignOut())

      const { local, remote } = args.createDatabases({ local: true, remote: '_users' })
      args.db = local
      args.remoteDB = remote
      args.cryptoStore = createCryptoStore(args.db, args.remoteDB)
    } catch (err) {
      console.error(err)
    }
  }
}

/**
 * Fetch all data of the user and process it into a formatted JSON (row data)
 * and Second Life viewers files format.
 * @returns {object} JSON data and array of files (text).
 */
export function downloadAccountData () {
  return async (dispatch, getState, { cryptoStore }) => {
    const allAvatars = await cryptoStore.withIdPrefix('avatars/').findAll()

    const avatarData = await Promise.all(allAvatars.map(async avatar => {
      const avatarStore = cryptoStore.withIdPrefix(avatar.dataSaveId + '/')

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
    const grids = await cryptoStore.withIdPrefix('grids/').findAll()

    const raw = {
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

export function deleteAccount (password) {
  return async (dispatch, getState, { db }) => {
    const { name } = await getUserInfo(db)
    const { loginPassword } = await derivePasswords(name, password)

    const accountDataReq = await window.fetch('/api/account', {
      method: 'GET',
      headers: {
        Authorization: 'Basic ' + window.btoa(`${name}:${loginPassword}`),
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })

    const toError = async req => {
      const result = await req.json()
      const err = new Error(result.errors[0].title)
      err.name = result.errors[0].title
      err.message = result.errors[0].detail
      throw err
    }

    if (accountDataReq.ok) {
      dispatch(signOut())

      const accountDelReq = await window.fetch('/api/account', {
        method: 'DELETE',
        headers: {
          Authorization: 'Basic ' + window.btoa(`${name}:${loginPassword}`),
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!accountDelReq.ok) {
        await toError(accountDelReq)
      }
    } else {
      await toError(accountDataReq)
    }
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
