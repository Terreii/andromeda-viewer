import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { v4 } from 'uuid'

import { signInStatus, selectShowToS, signOut } from '../bundles/account'
import {
  saveAvatar,
  loadSavedAvatars,
  saveGrid,
  loadSavedGrids,
  isSignedIn,
  doGetToSAgreeState,
  doAgreeToToS,
  unlock
} from './viewerAccount'

import AvatarName from '../avatarName'
import configureStore from '../store/configureStore'

jest.mock('uuid')
v4.mockReturnValue('b039f51f-41d9-41e7-a4b1-5490fbfd5eb9')

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
      hoodie: {
        cryptoStore: {
          withIdPrefix
        }
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

describe('Welcoming and Terms of Service state', () => {
  // Please update this every time the ToS are changed!
  const currentToSVersion = 1

  it('loads terms of service state and subscribe to changes of it', async () => {
    const find = jest.fn().mockResolvedValueOnce({
      _id: 'terms_of_service',
      version: currentToSVersion
    })
    const on = jest.fn()
    const withIdPrefix = jest.fn(() => ({ on }))

    window.hoodie = {
      store: {
        find,
        withIdPrefix
      }
    }
    const store = configureStore()

    expect(selectShowToS(store.getState())).toBe(false)

    await store.dispatch(doGetToSAgreeState())

    expect(find).toHaveBeenLastCalledWith('terms_of_service')

    expect(withIdPrefix).toHaveBeenLastCalledWith('terms_of_service')

    expect(on).toHaveBeenCalled()
    expect(typeof on.mock.calls[0][0]).toBe('function')

    expect(selectShowToS(store.getState())).toBe(false)
  })

  it('should display the ToS if the last version is older then current', async () => {
    const find = jest.fn().mockResolvedValueOnce({
      _id: 'terms_of_service',
      version: currentToSVersion - 1
    })
    const on = jest.fn()
    const withIdPrefix = jest.fn(() => ({ on }))

    window.hoodie = {
      store: {
        find,
        withIdPrefix
      }
    }
    const store = configureStore()

    expect(selectShowToS(store.getState())).toBe(false)

    await store.dispatch(doGetToSAgreeState())

    expect(find).toBeCalled()
    expect(on).toBeCalled()

    expect(selectShowToS(store.getState())).toBeTruthy()
  })

  it('should display the ToS if "terms_of_service" doc doesn\'t exist', async () => {
    const find = jest.fn().mockImplementationOnce(id => {
      const missing = new Error(`Object with id "${id}" is missing`)
      missing.name = 'Not found'
      missing.status = 404
      return Promise.reject(missing)
    })
    const on = jest.fn()
    const withIdPrefix = jest.fn(() => ({ on }))

    window.hoodie = {
      store: {
        find,
        withIdPrefix
      }
    }
    const store = configureStore()

    expect(selectShowToS(store.getState())).toBe(false)

    await store.dispatch(doGetToSAgreeState())

    expect(find).toBeCalled()
    expect(on).toBeCalled()

    expect(selectShowToS(store.getState())).toBeTruthy()
  })

  it('should close the Welcoming and ToS dialog and store a "terms_of_service" doc', async () => {
    const find = jest.fn().mockImplementationOnce(id => {
      const missing = new Error(`Object with id "${id}" is missing`)
      missing.name = 'Not found'
      missing.status = 404
      return Promise.reject(missing)
    })
    const on = jest.fn()
    const withIdPrefix = jest.fn(() => ({ on }))

    const updateOrAdd = jest.fn().mockImplementation(obj => Promise.resolve(obj))

    window.hoodie = {
      store: {
        find,
        updateOrAdd,
        withIdPrefix
      }
    }
    const store = configureStore()

    await store.dispatch(doGetToSAgreeState())

    expect(selectShowToS(store.getState())).toBeTruthy()

    await store.dispatch(doAgreeToToS())

    expect(selectShowToS(store.getState())).toBeFalsy()

    expect(updateOrAdd).toBeCalled()
    expect(updateOrAdd.mock.calls[0]).toEqual({
      _id: 'terms_of_service',
      version: currentToSVersion
    })
  })

  it('should not display the Welcome/ToS dialog after viewer-account sign out', async () => {
    const find = jest.fn().mockResolvedValueOnce({
      _id: 'terms_of_service',
      version: currentToSVersion
    })
    const on = jest.fn()
    const withIdPrefix = jest.fn(() => ({ on }))

    window.hoodie = {
      store: {
        find,
        withIdPrefix
      }
    }
    const store = configureStore()

    store.dispatch(signInStatus(true, true, 'tester.mactestface@viewer.com'))

    await store.dispatch(doGetToSAgreeState())

    expect(selectShowToS(store.getState())).toBe(false)

    store.dispatch(signOut())

    expect(selectShowToS(store.getState())).toBe(false)
  })

  it('should not display the welcome/ToS if the viewer is not unlocked', async () => {
    const find = jest.fn().mockResolvedValueOnce({
      _id: 'terms_of_service',
      version: currentToSVersion - 1
    })
    const on = jest.fn()
    const withIdPrefix = jest.fn(() => ({ on }))

    window.hoodie = {
      account: {
        one: () => {}
      },
      store: {
        find,
        withIdPrefix
      }
    }
    const store = configureStore()

    expect(selectShowToS(store.getState())).toBe(false)

    await store.dispatch(doGetToSAgreeState())

    store.dispatch(signInStatus(true, false, 'tester.mactestface@viewer.com'))

    expect(selectShowToS(store.getState())).toBe(false)

    await store.dispatch(unlock())

    expect(selectShowToS(store.getState())).toBe(true)
  })
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
  const accountOne = jest.fn((event, fn) => {
    callback = fn
  })

  const store = configureMockStore([
    thunk.withExtraArgument({
      hoodie: {
        account: {
          one: accountOne
        },
        cryptoStore: {
          withIdPrefix
        }
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
  expect(accountOne.mock.calls.length).toBe(1)
  expect(accountOne.mock.calls[0][0]).toBe('signout')
  expect(accountOne.mock.calls[0][1]).toBeInstanceOf(Function)
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
      hoodie: {
        cryptoStore: {
          withIdPrefix
        }
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
  const accountOne = jest.fn((event, fn) => {
    callback = fn
  })

  const store = configureMockStore([
    thunk.withExtraArgument({
      hoodie: {
        account: {
          one: accountOne
        },
        cryptoStore: {
          withIdPrefix
        }
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
  expect(accountOne.mock.calls.length).toBe(1)
  expect(accountOne.mock.calls[0][0]).toBe('signout')
  expect(accountOne.mock.calls[0][1]).toBeInstanceOf(Function)
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
  const get = jest.fn(() => Promise.resolve(result))

  let handler = null
  const on = jest.fn((type, fn) => {
    handler = fn
  })
  let callback = null
  const one = jest.fn((event, fn) => {
    callback = fn
  })
  const off = jest.fn()

  const store = configureMockStore([thunk.withExtraArgument({
    hoodie: {
      account: {
        get,
        on,
        one,
        off
      }
    }
  })])()

  result = {}
  const isSignedInResultNotLoggedIn = await store.dispatch(isSignedIn())

  expect(isSignedInResultNotLoggedIn).toBeFalsy()

  result = {
    session: 'sdkfgnsdnf',
    username: 'tester.mactestface@viewer.com'
  }
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

  store.clearActions()

  expect(get.mock.calls).toEqual([
    [
      ['session', 'username']
    ],
    [
      ['session', 'username']
    ]
  ])
  expect(on.mock.calls.length).toBe(1)
  expect(on.mock.calls[0][0]).toBe('update')

  const eventHandler = on.mock.calls[0][1]
  expect(eventHandler).toBeInstanceOf(Function)
  expect(one.mock.calls.length).toBe(1)
  expect(one.mock.calls[0][0]).toBe('signout')
  expect(off.mock.calls.length).toBe(0)

  handler({ username: 'new.phone@whois.this' })

  expect(store.getActions()).toEqual([
    {
      type: 'account/didUpdate',
      payload: {
        username: 'new.phone@whois.this'
      }
    }
  ])

  callback()

  expect(off.mock.calls).toEqual([
    ['update', eventHandler]
  ])
})

it('should unlock the app with "unlock"', async () => {
  const unlockCryptoStore = jest.fn(() => Promise.resolve())
  const findAll = jest.fn(() => Promise.resolve([]))
  const on = jest.fn()
  const one = jest.fn()

  const store = configureMockStore([thunk.withExtraArgument({
    hoodie: {
      cryptoStore: {
        unlock: unlockCryptoStore,
        withIdPrefix: prefix => ({
          findAll: findAll.bind(null, prefix),
          on: on.bind(null, prefix)
        })
      },
      account: {
        one
      }
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

  expect(unlockCryptoStore.mock.calls).toEqual([
    ['password']
  ])
  expect(findAll.mock.calls).toEqual([
    ['grids/'],
    ['avatars/']
  ])
  expect(on.mock.calls.length).toBe(2)
  expect(on.mock.calls[0][0]).toBe('grids/')
  expect(on.mock.calls[1][0]).toBe('avatars/')
  expect(one.mock.calls.length).toBe(2)
  expect(one.mock.calls[0][0]).toBe('signout')
  expect(one.mock.calls[1][0]).toBe('signout')
})
