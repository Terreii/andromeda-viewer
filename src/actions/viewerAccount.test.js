import { v4 } from 'uuid'

import { createTestStore, createUniqueDb, AppState } from '../testUtils'

import {
  saveAvatar,
  loadSavedAvatars,
  saveGrid,
  loadSavedGrids,
  isSignedIn
} from './viewerAccount'

import AvatarName from '../avatarName'

let localDB
let remoteDB

beforeEach(() => {
  localDB = createUniqueDb('local_test_db')
})

describe('isSignedIn', () => {
  it('should check the remote db for the login state', async () => {
    remoteDB = createUniqueDb('remote_test_db')
    const getSession = jest.fn()
    remoteDB.getSession = getSession

    const { store, getDiff, getCurrentDbs } = await createTestStore({
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

    const { store, getDiff, getCurrentDbs } = await createTestStore({
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

    const { store, getDiff, getCurrentDbs } = await createTestStore({
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

  it('should match the same state to createTestStore with LoggedIn state option', async () => {
    remoteDB = createUniqueDb('remote_test_db')
    const getSession = jest.fn()
    remoteDB.getSession = getSession

    const { store } = await createTestStore({
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

    const state = store.getState()
    await localDB.destroy()
    localDB = createUniqueDb('local_test_db')

    const { store: store2 } = await createTestStore({ localDB, state: AppState.LoggedIn })

    expect(store2.getState()).toEqual(state)
  })
})

describe('unlock', () => {
  // can only be fully tested, once the tests run in a browser.

  it('should have an unlocked state with createTestStore', async () => {
    const { store, cryptoStore, getCurrentDbs } = await createTestStore({
      localDB,
      state: AppState.Unlocked
    })

    expect(store.getState().account.loggedIn).toBe(true)
    expect(store.getState().account.unlocked).toBe(true)
    expect(store.getState().account.username).toBe('tester.mactestface@example.com')

    await cryptoStore.add({ _id: 'test', value: 42 })

    expect((await getCurrentDbs().local.get('test')).value).toBeUndefined()
  })
})

describe('avatars', () => {
  it('should load avatars', async () => {
    const { store, cryptoStore, getDiff } = await createTestStore({
      localDB,
      state: AppState.LoggedIn
    })

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

    await store.dispatch(loadSavedAvatars())

    expect(getDiff()).toEqual({
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
    const { store, cryptoStore, setMark, getDiff } = await createTestStore({
      localDB,
      state: AppState.LoggedIn
    })

    await cryptoStore.unlock('testPassword')

    await store.dispatch(loadSavedAvatars())

    setMark('A')

    await cryptoStore.add({
      _id: 'avatars/b039f51f-41d9-41e7-a4b1-5490fbfd5eb9',
      dataSaveId: 'b039f51f-41d9-41e7-a4b1-5490fbfd5eb9',
      avatarIdentifier: 'b039f51f-41d9-41e7-a4b1-5490fbfd5eb9@Second Life',
      name: 'Tester Resident',
      grid: 'Second Life'
    })

    await new Promise(resolve => setTimeout(resolve, 10))

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
    const { store, cryptoStore, setMark, getDiff } = await createTestStore({
      localDB,
      state: AppState.LoggedIn
    })

    await cryptoStore.unlock('testPassword')

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
    const { store, cryptoStore, setMark, getDiff } = await createTestStore({
      localDB,
      state: AppState.LoggedIn
    })

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
    const { store, cryptoStore, setMark, getDiff } = await createTestStore({
      localDB,
      state: AppState.LoggedIn
    })

    await cryptoStore.unlock('testPassword')

    await store.dispatch(loadSavedGrids())

    setMark('A')

    await cryptoStore.add({
      _id: 'grids/36e414df-5629-4eec-b1c2-da4fa1d91be7',
      name: 'Test Land',
      loginURL: 'https://login.test-land.grid/login',
      isLLSDLogin: false
    })

    await new Promise(resolve => setTimeout(resolve, 10))

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
    const { store, cryptoStore, setMark, getDiff } = await createTestStore({
      localDB,
      state: AppState.LoggedIn
    })

    await cryptoStore.unlock('testPassword')

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

    await new Promise(resolve => setTimeout(resolve, 10))

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
