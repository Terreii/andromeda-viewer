import nodeCrypto from 'crypto'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { v4 } from 'uuid'

import { createTestStore, createUniqueDb } from '../testUtils'

import { signInStatus } from '../bundles/account'
import {
  saveAvatar,
  loadSavedAvatars,
  saveGrid,
  loadSavedGrids,
  isSignedIn,
  unlock
} from './viewerAccount'

import AvatarName from '../avatarName'

window.TextEncoder = class TextEncoder {
  encode (text) {
    return Buffer.from(text)
  }
}

let localDB
let remoteDB

beforeEach(() => {
  localDB = createUniqueDb('local_test_db')
})

afterEach(async () => {
  await localDB.destroy()
  if (remoteDB) {
    try {
      await remoteDB.destroy()
    } catch (_err) {}
    remoteDB = null
  }
})

describe('isSignedIn', () => {
  it('should check the remote db for the login state', async () => {
    remoteDB = createUniqueDb('remote_test_db')
    const getSession = jest.fn()
    remoteDB.getSession = getSession

    const { store, getDiff, getCurrentDbs } = createTestStore({
      localDB,
      remoteDB
    })

    getSession.mockResolvedValueOnce({
      info: {
        authenticated: 'cookie',
        authentication_db: '_users',
        authentication_handlers: ['cookie', 'default']
      },
      ok: true,
      userCtx: {
        name: 'tester.mactestface@example.com',
        roles: []
      }
    })
    await store.dispatch(isSignedIn())

    expect(getDiff()).toEqual({
      account: {
        loggedIn: true,
        username: 'tester.mactestface@example.com'
      }
    })
    expect(getCurrentDbs().local).toBe(localDB)
    expect(getCurrentDbs().remote).not.toBe(remoteDB)
    remoteDB = getCurrentDbs().remote
  })

  it('should check the local database if no cookie session is active', async () => {
    remoteDB = createUniqueDb('remote_test_db')
    const getSession = jest.fn()
    remoteDB.getSession = getSession

    const { store, getDiff, getCurrentDbs } = createTestStore({
      localDB,
      remoteDB
    })

    getSession.mockResolvedValueOnce({
      info: {
        authenticated: 'cookie',
        authentication_db: '_users',
        authentication_handlers: ['cookie', 'default']
      },
      ok: true,
      userCtx: {
        name: null,
        roles: []
      }
    })
    await localDB.put({
      _id: '_local/account',
      accountId: v4(),
      name: 'tester.mactestface@example.com'
    })
    await store.dispatch(isSignedIn())

    expect(getDiff()).toEqual({
      account: {
        loggedIn: true,
        username: 'tester.mactestface@example.com'
      }
    })
    expect(getCurrentDbs().local).toBe(localDB)
    expect(getCurrentDbs().remote).not.toBe(remoteDB)
    remoteDB = getCurrentDbs().remote
  })

  it('should set the state to loggedOut if no cookie session and account doc exists', async () => {
    remoteDB = createUniqueDb('remote_test_db')
    const getSession = jest.fn()
    remoteDB.getSession = getSession

    const { store, getDiff, getCurrentDbs } = createTestStore({
      localDB,
      remoteDB
    })

    getSession.mockResolvedValueOnce({
      info: {
        authenticated: 'cookie',
        authentication_db: '_users',
        authentication_handlers: ['cookie', 'default']
      },
      ok: true,
      userCtx: {
        name: null,
        roles: []
      }
    })
    await store.dispatch(isSignedIn())

    expect(getDiff()).toEqual({})
    expect(getCurrentDbs().local).toBe(localDB)
    expect(getCurrentDbs().remote).toBe(remoteDB)
  })
})

it('didSignIn', () => {
  const store = configureMockStore([thunk])()

  store.dispatch(signInStatus(true, false))

  store.dispatch(signInStatus())

  store.dispatch(signInStatus(true, true))

  store.dispatch(signInStatus(true, true, 'tester.mactestface@viewer.com'))

  store.dispatch(signInStatus(true, false, 'tester.mactestface@viewer.com'))

  store.dispatch(signInStatus(false, false, 'tester.mactestface@viewer.com'))

  expect(store.getActions()).toEqual([
    {
      type: 'account/signInStatus',
      payload: {
        isLoggedIn: true,
        isUnlocked: false,
        username: ''
      }
    },
    {
      type: 'account/signInStatus',
      payload: {
        isLoggedIn: false,
        isUnlocked: undefined,
        username: ''
      }
    },
    {
      type: 'account/signInStatus',
      payload: {
        isLoggedIn: true,
        isUnlocked: true,
        username: ''
      }
    },
    {
      type: 'account/signInStatus',
      payload: {
        isLoggedIn: true,
        isUnlocked: true,
        username: 'tester.mactestface@viewer.com'
      }
    },
    {
      type: 'account/signInStatus',
      payload: {
        isLoggedIn: true,
        isUnlocked: false,
        username: 'tester.mactestface@viewer.com'
      }
    },
    {
      type: 'account/signInStatus',
      payload: {
        isLoggedIn: false,
        isUnlocked: false,
        username: ''
      }
    }
  ])
})

describe('avatars', () => {
  it('should load avatars', async () => {
    const { store, cryptoStore, setMark, getDiff } = createTestStore({ localDB })

    await cryptoStore.setup('testPassword')
    await cryptoStore.unlock('testPassword')

    await cryptoStore.withIdPrefix('avatars/').add([
      {
        _id: '36e414df-5629-4eec-b1c2-da4fa1d91be7',
        avatarIdentifier: 'f2373437-a2ef-4435-82b9-68d283538bb2@grid.org',
        dataSaveId: 'b039f51f-41d9-41e7-a4b1-5490fbfd5eb9',
        grid: 'grid.org',
        name: 'Tester Resident'
      },
      {
        _id: '98d0193b-6358-4144-b65c-a871f1692dbb',
        avatarIdentifier: 'e0f1adac-d250-4d71-b4e4-10e0ee855d0e@grid.org',
        dataSaveId: 'e3b35551-3896-44c0-b1d7-2459e35c39fd',
        grid: 'grid.org',
        name: 'Tester MacTestface'
      }
    ])

    store.dispatch(signInStatus(true, true, 'tester.mactestface@example.com'))

    setMark('A')
    await store.dispatch(loadSavedAvatars())

    expect(getDiff('A')).toEqual({
      account: {
        savedAvatars: {
          0: {
            _id: 'avatars/36e414df-5629-4eec-b1c2-da4fa1d91be7',
            _rev: expect.any(String),
            hoodie: {
              createdAt: expect.any(String)
            },
            dataSaveId: 'b039f51f-41d9-41e7-a4b1-5490fbfd5eb9',
            avatarIdentifier: 'f2373437-a2ef-4435-82b9-68d283538bb2@grid.org',
            grid: 'grid.org',
            name: 'Tester Resident'
          },
          1: {
            _id: 'avatars/98d0193b-6358-4144-b65c-a871f1692dbb',
            _rev: expect.any(String),
            hoodie: {
              createdAt: expect.any(String)
            },
            avatarIdentifier: 'e0f1adac-d250-4d71-b4e4-10e0ee855d0e@grid.org',
            dataSaveId: 'e3b35551-3896-44c0-b1d7-2459e35c39fd',
            grid: 'grid.org',
            name: 'Tester MacTestface'
          }
        },
        savedAvatarsLoaded: true
      }
    })
  })

  it('should load avatars that are added later', async () => {
    const { store, cryptoStore, setMark, getDiff } = createTestStore({ localDB })

    await cryptoStore.setup('testPassword')
    await cryptoStore.unlock('testPassword')
    store.dispatch(signInStatus(true, true, 'tester.mactestface@example.com'))
    await store.dispatch(loadSavedAvatars())

    setMark('A')

    await cryptoStore.add({
      _id: 'avatars/b039f51f-41d9-41e7-a4b1-5490fbfd5eb9',
      dataSaveId: 'b039f51f-41d9-41e7-a4b1-5490fbfd5eb9',
      avatarIdentifier: 'b039f51f-41d9-41e7-a4b1-5490fbfd5eb9@Second Life',
      name: 'Tester Resident',
      grid: 'Second Life'
    })

    await new Promise(resolve => setTimeout(resolve, 5))

    expect(getDiff('A')).toEqual({
      account: {
        savedAvatars: {
          0: {
            _id: 'avatars/b039f51f-41d9-41e7-a4b1-5490fbfd5eb9',
            _rev: expect.any(String),
            hoodie: {
              createdAt: expect.any(String)
            },
            dataSaveId: 'b039f51f-41d9-41e7-a4b1-5490fbfd5eb9',
            avatarIdentifier: 'b039f51f-41d9-41e7-a4b1-5490fbfd5eb9@Second Life',
            name: 'Tester Resident',
            grid: 'Second Life'
          }
        }
      }
    })
  })

  it('should save an avatar', async () => {
    const { store, cryptoStore, setMark, getDiff } = createTestStore({ localDB })

    await cryptoStore.setup('testPassword')
    await cryptoStore.unlock('testPassword')
    store.dispatch(signInStatus(true, true, 'tester.mactestface@example.com'))
    await store.dispatch(loadSavedAvatars())

    setMark('A')

    const avatarIdentifier = v4()
    const result = await store.dispatch(saveAvatar(
      new AvatarName('Tester'),
      avatarIdentifier,
      'Second Life'
    ))

    expect(result).toEqual({
      _id: expect.any(String),
      _rev: expect.any(String),
      hoodie: {
        createdAt: expect.any(String)
      },
      dataSaveId: expect.any(String),
      avatarIdentifier: avatarIdentifier + '@Second Life',
      name: 'Tester Resident',
      grid: 'Second Life'
    })

    await new Promise(resolve => setTimeout(resolve, 5))

    expect(getDiff('A')).toEqual({
      account: {
        savedAvatars: {
          0: {
            _id: expect.any(String),
            _rev: expect.any(String),
            hoodie: {
              createdAt: expect.any(String)
            },
            dataSaveId: expect.any(String),
            avatarIdentifier: avatarIdentifier + '@Second Life',
            name: 'Tester Resident',
            grid: 'Second Life'
          }
        }
      }
    })
  })
})

describe('grids', () => {
  it('should load grids', async () => {
    const { store, cryptoStore, setMark, getDiff } = createTestStore({ localDB })

    await cryptoStore.setup('testPassword')
    await cryptoStore.unlock('testPassword')

    await cryptoStore.withIdPrefix('grids/').add([
      {
        _id: '36e414df-5629-4eec-b1c2-da4fa1d91be7',
        name: 'Test Land',
        loginURL: 'https://login.test-land.grid/login',
        isLLSDLogin: false
      },
      {
        _id: '98d0193b-6358-4144-b65c-a871f1692dbb',
        name: 'Private Land',
        loginURL: 'https://localhost:1234/login',
        isLLSDLogin: true
      }
    ])

    await new Promise(resolve => setTimeout(resolve, 5))

    store.dispatch(signInStatus(true, true, 'tester.mactestface@example.com'))

    setMark('A')
    await store.dispatch(loadSavedGrids())

    expect(getDiff('A')).toEqual({
      account: {
        savedGridsLoaded: true,
        savedGrids: {
          3: {
            _id: 'grids/36e414df-5629-4eec-b1c2-da4fa1d91be7',
            _rev: expect.any(String),
            hoodie: {
              createdAt: expect.any(String)
            },
            name: 'Test Land',
            loginURL: 'https://login.test-land.grid/login',
            isLLSDLogin: false
          },
          4: {
            _id: 'grids/98d0193b-6358-4144-b65c-a871f1692dbb',
            _rev: expect.any(String),
            hoodie: {
              createdAt: expect.any(String)
            },
            name: 'Private Land',
            loginURL: 'https://localhost:1234/login',
            isLLSDLogin: true
          }
        }
      }
    })
  })

  it('should load grids that are added later', async () => {
    const { store, cryptoStore, setMark, getDiff } = createTestStore({ localDB })

    await cryptoStore.setup('testPassword')
    await cryptoStore.unlock('testPassword')
    store.dispatch(signInStatus(true, true, 'tester.mactestface@example.com'))
    await store.dispatch(loadSavedGrids())

    setMark('A')

    await cryptoStore.add({
      _id: 'grids/36e414df-5629-4eec-b1c2-da4fa1d91be7',
      name: 'Test Land',
      loginURL: 'https://login.test-land.grid/login',
      isLLSDLogin: false
    })

    await new Promise(resolve => setTimeout(resolve, 5))

    expect(getDiff('A')).toEqual({
      account: {
        savedGrids: {
          3: {
            _id: 'grids/36e414df-5629-4eec-b1c2-da4fa1d91be7',
            _rev: expect.any(String),
            hoodie: {
              createdAt: expect.any(String)
            },
            name: 'Test Land',
            loginURL: 'https://login.test-land.grid/login',
            isLLSDLogin: false
          }
        }
      }
    })
  })

  it('should save a grid', async () => {
    const { store, cryptoStore, setMark, getDiff } = createTestStore({ localDB })

    await cryptoStore.setup('testPassword')
    await cryptoStore.unlock('testPassword')
    store.dispatch(signInStatus(true, true, 'tester.mactestface@example.com'))
    await store.dispatch(loadSavedGrids())

    setMark('A')

    const result = await store.dispatch(saveGrid({
      name: 'Test Land',
      loginURL: 'https://login.test-land.grid/login'
    }))

    expect(result).toEqual({
      _id: expect.any(String),
      _rev: expect.any(String),
      hoodie: {
        createdAt: expect.any(String)
      },
      name: 'Test Land',
      loginURL: 'https://login.test-land.grid/login',
      isLLSDLogin: false
    })

    await new Promise(resolve => setTimeout(resolve, 5))

    expect(getDiff('A')).toEqual({
      account: {
        savedGrids: {
          3: {
            _id: expect.any(String),
            _rev: expect.any(String),
            hoodie: {
              createdAt: expect.any(String)
            },
            name: 'Test Land',
            loginURL: 'https://login.test-land.grid/login',
            isLLSDLogin: false
          }
        }
      }
    })
  })
})

it.skip('should check sign in status with "isSignedIn"', async () => {
  let result = null

  const store = configureMockStore([thunk.withExtraArgument({
    db: new PouchDB('localDB', { adapter: 'memory' }),
    remoteDB: {
      getSession: () => {
        return Promise.resolve({
          userCtx: { name: result }
        })
      }
    }
  })])()

  result = null
  const isSignedInResultNotLoggedIn = await store.dispatch(isSignedIn())

  expect(isSignedInResultNotLoggedIn).toBeFalsy()

  result = 'tester.mactestface@viewer.com'
  const isSignedInResult = await store.dispatch(isSignedIn())

  expect(isSignedInResult).toBeTruthy()

  expect(store.getActions()).toEqual([
    {
      type: 'account/signInStatus',
      payload: {
        isLoggedIn: false,
        isUnlocked: null,
        username: ''
      }
    },
    {
      type: 'account/signInStatus',
      payload: {
        isLoggedIn: true,
        isUnlocked: null,
        username: 'tester.mactestface@viewer.com'
      }
    }
  ])
})

it.skip('should unlock the app with "unlock"', async () => {
  const unlockCryptoStore = jest.fn(() => Promise.resolve())
  const findAll = jest.fn(() => Promise.resolve([]))
  const on = jest.fn()
  const once = jest.fn()
  const logIn = jest.fn(() => Promise.resolve())
  const sync = jest.fn(() => ({
    on: () => {}
  }))

  let lastKeyObj = null
  let lastHashFn = ''
  let lastPw = ''
  const importKey = jest.fn((type, pw, hashFn, exportable, arg) => {
    expect(type).toBe('raw')
    expect(exportable).toBeFalsy()
    expect(arg).toEqual(['deriveBits'])
    lastKeyObj = {}
    lastHashFn = hashFn
    lastPw = pw
    return Promise.resolve(lastKeyObj)
  })

  let lastKey = null
  const deriveBits = jest.fn((args, key, keyLength) => {
    expect(key).toBe(lastKeyObj)
    expect(args.name).toBe(lastHashFn)
    expect(args.hash).toBe('SHA-512')
    expect(keyLength).toBe(512)

    if (args.name === 'PBKDF2') {
      const hash = args.hash.toLowerCase().replace('-', '')
      const key = nodeCrypto.pbkdf2Sync(lastPw, args.salt, args.iterations, keyLength, hash)
      lastKey = key
      return Promise.resolve(key)
    } else if (args.name === 'HKDF') {
      return Promise.resolve(Buffer.concat([
        Buffer.alloc(32, 1),
        Buffer.alloc(32, 2)
      ]))
    } else {
      throw new TypeError('unknown hash: ' + args.name)
    }
  })

  window.crypto = {
    subtle: {
      importKey,
      deriveBits
    }
  }

  const store = configureMockStore([thunk.withExtraArgument({
    db: {
      get (id) {
        if (id === '_local/account') {
          return Promise.resolve({
            _id: '_local/account',
            accountId: 'a_id',
            name: 'tester'
          })
        }
      },
      sync,
      on,
      once
    },
    remoteDB: {
      close: () => {},
      logIn
    },
    cryptoStore: {
      unlock: unlockCryptoStore,
      withIdPrefix: prefix => ({
        findAll: findAll.bind(null, prefix),
        on: on.bind(null, prefix)
      })
    }
  })])({
    account: {
      loggedIn: true,
      unlocked: false
    }
  })

  await store.dispatch(unlock('password'))

  expect(store.getActions()).toEqual([
    { type: 'account/unlocked', payload: undefined },
    {
      type: 'account/gridsLoaded',
      payload: []
    },
    {
      type: 'account/avatarsLoaded',
      payload: []
    }
  ])

  expect(lastPw).toBe(lastKey)
  expect(findAll).toHaveBeenNthCalledWith(1, 'grids/')
  expect(findAll).toHaveBeenNthCalledWith(2, 'avatars/')

  expect(on).toBeCalledTimes(2)
  expect(on).toHaveBeenNthCalledWith(1, 'grids/', 'change', expect.any(Function))
  expect(on).toHaveBeenNthCalledWith(2, 'avatars/', 'change', expect.any(Function))

  expect(once).toBeCalledTimes(2)
  expect(once).toHaveBeenNthCalledWith(1, 'destroyed', expect.any(Function))
  expect(once).toHaveBeenNthCalledWith(2, 'destroyed', expect.any(Function))

  expect(logIn).toHaveBeenCalledWith(
    'a_id',
    '0101010101010101010101010101010101010101010101010101010101010101'
  )
  expect(unlockCryptoStore).toHaveBeenCalledWith(
    '0202020202020202020202020202020202020202020202020202020202020202'
  )
  expect(sync).toBeCalled()
})
