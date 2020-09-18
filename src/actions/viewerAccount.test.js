import nodeCrypto from 'crypto'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { v4 } from 'uuid'
import PouchDB from 'pouchdb-browser'
import memoryAdapter from 'pouchdb-adapter-memory'
import hoodieApi from 'pouchdb-hoodie-api'

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

PouchDB.plugin(memoryAdapter)
PouchDB.plugin(hoodieApi)

jest.mock('uuid')
v4.mockReturnValue('b039f51f-41d9-41e7-a4b1-5490fbfd5eb9')

window.TextEncoder = class TextEncoder {
  encode (text) {
    return Buffer.from(text)
  }
}

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

it('saveAvatar', async () => {
  const add = jest.fn(arg => Promise.resolve(arg))
  const withIdPrefix = jest.fn(() => ({ add }))

  const store = configureMockStore([
    thunk.withExtraArgument({
      cryptoStore: {
        withIdPrefix
      }
    })
  ])({
    account: {
      savedAvatars: [
        { avatarIdentifier: 'e0f1adac-d250-4d71-b4e4-10e0ee855d0e@grid.org' }
      ]
    }
  })

  const name = new AvatarName('tester')

  await expect(
    store.dispatch(saveAvatar(name, 'e0f1adac-d250-4d71-b4e4-10e0ee855d0e', 'grid.org'))
  ).rejects.toThrow('Avatar already exist!')

  await store.dispatch(saveAvatar(name, 'f2373437-a2ef-4435-82b9-68d283538bb2', 'grid.org'))

  expect(add.mock.calls.length).toBe(1)
  expect(add.mock.calls[0]).toEqual([
    {
      dataSaveId: 'b039f51f-41d9-41e7-a4b1-5490fbfd5eb9',
      avatarIdentifier: 'f2373437-a2ef-4435-82b9-68d283538bb2@grid.org',
      name: 'Tester Resident',
      grid: 'grid.org'
    }
  ])
})

it('loadSavedAvatars', async () => {
  const findAll = jest.fn(() => Promise.resolve([
    {
      _id: 'avatars/5e922960-d3f6-451d-9e76-346e4e8a988c',
      _rev: '1-2983e9823',
      hoodie: { createdAt: '2019-12-04T19:10:47.756Z' },
      avatarIdentifier: 'f2373437-a2ef-4435-82b9-68d283538bb2@grid.org',
      dataSaveId: 'b039f51f-41d9-41e7-a4b1-5490fbfd5eb9',
      grid: 'grid.org',
      name: 'Tester Resident'
    },
    {
      _id: 'avatars/5e922960-d3f6-451d-9e76-346e4e8a988c',
      _rev: '1-2983e9823',
      hoodie: { createdAt: '2019-12-03T19:10:47.756Z' },
      avatarIdentifier: 'e0f1adac-d250-4d71-b4e4-10e0ee855d0e@grid.org',
      dataSaveId: 'e3b35551-3896-44c0-b1d7-2459e35c39fd',
      grid: 'grid.org',
      name: 'Tester MacTestface'
    }
  ]))
  const on = jest.fn()
  const off = jest.fn()

  const withIdPrefix = jest.fn(() => ({
    findAll,
    on,
    off
  }))

  let callback = null
  const dbOnce = jest.fn((event, fn) => {
    callback = fn
  })

  const store = configureMockStore([
    thunk.withExtraArgument({
      db: {
        once: dbOnce
      },
      cryptoStore: {
        withIdPrefix
      }
    })
  ])({
    account: {
      loggedIn: true,
      username: 'tester@viewer.com',
      savedAvatarsLoaded: false
    }
  })

  await store.dispatch(loadSavedAvatars())

  expect(store.getActions()).toEqual([
    {
      type: 'account/avatarsLoaded',
      payload: [
        {
          _id: 'avatars/5e922960-d3f6-451d-9e76-346e4e8a988c',
          _rev: '1-2983e9823',
          hoodie: { createdAt: '2019-12-03T19:10:47.756Z' },
          avatarIdentifier: 'e0f1adac-d250-4d71-b4e4-10e0ee855d0e@grid.org',
          dataSaveId: 'e3b35551-3896-44c0-b1d7-2459e35c39fd',
          grid: 'grid.org',
          name: 'Tester MacTestface'
        },
        {
          _id: 'avatars/5e922960-d3f6-451d-9e76-346e4e8a988c',
          _rev: '1-2983e9823',
          hoodie: { createdAt: '2019-12-04T19:10:47.756Z' },
          avatarIdentifier: 'f2373437-a2ef-4435-82b9-68d283538bb2@grid.org',
          dataSaveId: 'b039f51f-41d9-41e7-a4b1-5490fbfd5eb9',
          grid: 'grid.org',
          name: 'Tester Resident'
        }
      ]
    }
  ])

  expect(withIdPrefix.mock.calls).toEqual([
    ['avatars/']
  ])
  expect(dbOnce.mock.calls.length).toBe(1)
  expect(dbOnce.mock.calls[0][0]).toBe('destroyed')
  expect(dbOnce.mock.calls[0][1]).toBeInstanceOf(Function)
  expect(on.mock.calls.length).toBe(1)
  expect(on.mock.calls[0][0]).toBe('change')

  const eventHandler = on.mock.calls[0][1]
  expect(eventHandler).toBeInstanceOf(Function)
  expect(off.mock.calls.length).toBe(0)

  store.clearActions()

  for (const type of ['add', 'update', 'remove']) {
    eventHandler(type, {
      _id: 'avatars/5e922960-d3f6-451d-9e76-346e4e8a988c',
      _rev: '1-2983e9823',
      hoodie: { createdAt: '2019-12-04T19:10:47.756Z' },
      avatarIdentifier: 'f2373437-a2ef-4435-82b9-68d283538bb2@grid.org',
      dataSaveId: 'b039f51f-41d9-41e7-a4b1-5490fbfd5eb9',
      grid: 'grid.org',
      name: 'Tester Resident'
    })
  }

  callback() // simulate signout

  expect(off.mock.calls.length).toBe(1)
  expect(off.mock.calls[0]).toEqual([
    'change',
    eventHandler // same function
  ])

  expect(store.getActions()).toEqual([
    {
      type: 'account/avatarSaved',
      payload: {
        _id: 'avatars/5e922960-d3f6-451d-9e76-346e4e8a988c',
        _rev: '1-2983e9823',
        hoodie: { createdAt: '2019-12-04T19:10:47.756Z' },
        avatarIdentifier: 'f2373437-a2ef-4435-82b9-68d283538bb2@grid.org',
        dataSaveId: 'b039f51f-41d9-41e7-a4b1-5490fbfd5eb9',
        grid: 'grid.org',
        name: 'Tester Resident'
      }
    },
    {
      type: 'account/savedAvatarUpdated',
      payload: {
        _id: 'avatars/5e922960-d3f6-451d-9e76-346e4e8a988c',
        _rev: '1-2983e9823',
        hoodie: { createdAt: '2019-12-04T19:10:47.756Z' },
        avatarIdentifier: 'f2373437-a2ef-4435-82b9-68d283538bb2@grid.org',
        dataSaveId: 'b039f51f-41d9-41e7-a4b1-5490fbfd5eb9',
        grid: 'grid.org',
        name: 'Tester Resident'
      }
    },
    {
      type: 'account/savedAvatarRemoved',
      payload: {
        _id: 'avatars/5e922960-d3f6-451d-9e76-346e4e8a988c',
        _rev: '1-2983e9823',
        hoodie: { createdAt: '2019-12-04T19:10:47.756Z' },
        avatarIdentifier: 'f2373437-a2ef-4435-82b9-68d283538bb2@grid.org',
        dataSaveId: 'b039f51f-41d9-41e7-a4b1-5490fbfd5eb9',
        grid: 'grid.org',
        name: 'Tester Resident'
      }
    }
  ])
})

it('saveGrid', async () => {
  const add = jest.fn(arg => Promise.resolve(arg))
  const withIdPrefix = jest.fn(() => ({ add }))

  const store = configureMockStore([
    thunk.withExtraArgument({
      cryptoStore: {
        withIdPrefix
      }
    })
  ])({
    account: {
      savedGrids: [
        {
          name: 'Second Life',
          loginURL: 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi',
          isLoginLLSD: true
        }
      ]
    }
  })

  await expect(store.dispatch(saveGrid({
    name: 'Second Life',
    loginURL: 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi'
  }))).rejects.toThrow('Grid already exist!')

  await store.dispatch(saveGrid({
    name: 'AwsomeGrid',
    loginURL: 'https://login.grid.org/login'
  }))

  expect(add.mock.calls.length).toBe(1)
  expect(add.mock.calls[0]).toEqual([
    {
      name: 'AwsomeGrid',
      loginURL: 'https://login.grid.org/login',
      isLLSDLogin: false
    }
  ])
})

it('loadSavedGrids', async () => {
  const findAll = jest.fn(() => Promise.resolve([
    {
      _id: 'grids/5e922960-d3f6-451d-9e76-346e4e8a988c',
      _rev: '1-2983e9823',
      hoodie: { createdAt: '2019-12-04T19:10:47.756Z' },
      name: 'Grid',
      loginURL: 'https://login.grid.org/login'
    },
    {
      _id: 'grids/e0f1adac-d250-4d71-b4e4-10e0ee855d0e',
      _rev: '1-2983e9823',
      hoodie: { createdAt: '2019-12-03T19:10:47.756Z' },
      name: 'Other',
      loginURL: 'https://login.example.org/'
    }
  ]))
  const on = jest.fn()
  const off = jest.fn()

  const withIdPrefix = jest.fn(() => ({
    findAll,
    on,
    off
  }))

  let callback = null
  const dbOnce = jest.fn((event, fn) => {
    callback = fn
  })

  const store = configureMockStore([
    thunk.withExtraArgument({
      db: {
        once: dbOnce
      },
      cryptoStore: {
        withIdPrefix
      }
    })
  ])({
    account: {
      loggedIn: true,
      username: 'tester@viewer.com',
      savedGridsLoaded: false
    }
  })

  await store.dispatch(loadSavedGrids())

  expect(store.getActions()).toEqual([
    {
      type: 'account/gridsLoaded',
      payload: [
        {
          _id: 'grids/5e922960-d3f6-451d-9e76-346e4e8a988c',
          _rev: '1-2983e9823',
          hoodie: { createdAt: '2019-12-04T19:10:47.756Z' },
          name: 'Grid',
          loginURL: 'https://login.grid.org/login'
        },
        {
          _id: 'grids/e0f1adac-d250-4d71-b4e4-10e0ee855d0e',
          _rev: '1-2983e9823',
          hoodie: { createdAt: '2019-12-03T19:10:47.756Z' },
          name: 'Other',
          loginURL: 'https://login.example.org/'
        }
      ]
    }
  ])

  expect(withIdPrefix.mock.calls).toEqual([
    ['grids/']
  ])
  expect(dbOnce.mock.calls.length).toBe(1)
  expect(dbOnce.mock.calls[0][0]).toBe('destroyed')
  expect(dbOnce.mock.calls[0][1]).toBeInstanceOf(Function)
  expect(on.mock.calls.length).toBe(1)
  expect(on.mock.calls[0][0]).toBe('change')

  const eventHandler = on.mock.calls[0][1]
  expect(eventHandler).toBeInstanceOf(Function)
  expect(off.mock.calls.length).toBe(0)

  store.clearActions()

  for (const type of ['add', 'update', 'remove']) {
    eventHandler(type, {
      _id: 'grids/e0f1adac-d250-4d71-b4e4-10e0ee855d0e',
      _rev: '1-2983e9823',
      hoodie: { createdAt: '2019-12-03T19:10:47.756Z' },
      name: 'Other',
      loginURL: 'https://login.example.org/'
    })
  }

  callback() // simulate signout

  expect(off.mock.calls.length).toBe(1)
  expect(off.mock.calls[0]).toEqual([
    'change',
    eventHandler // same function
  ])

  expect(store.getActions()).toEqual([
    {
      type: 'account/gridAdded',
      payload: {
        _id: 'grids/e0f1adac-d250-4d71-b4e4-10e0ee855d0e',
        _rev: '1-2983e9823',
        hoodie: { createdAt: '2019-12-03T19:10:47.756Z' },
        name: 'Other',
        loginURL: 'https://login.example.org/'
      }
    },
    {
      type: 'account/savedGridDidChanged',
      payload: {
        _id: 'grids/e0f1adac-d250-4d71-b4e4-10e0ee855d0e',
        _rev: '1-2983e9823',
        hoodie: { createdAt: '2019-12-03T19:10:47.756Z' },
        name: 'Other',
        loginURL: 'https://login.example.org/'
      }
    },
    {
      type: 'account/savedGridRemoved',
      payload: {
        _id: 'grids/e0f1adac-d250-4d71-b4e4-10e0ee855d0e',
        _rev: '1-2983e9823',
        hoodie: { createdAt: '2019-12-03T19:10:47.756Z' },
        name: 'Other',
        loginURL: 'https://login.example.org/'
      }
    }
  ])
})

it('should check sign in status with "isSignedIn"', async () => {
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

it('should unlock the app with "unlock"', async () => {
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
      expect(lastPw).toBe(lastKey)
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
