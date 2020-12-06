import { diff as getObjDiff } from 'deep-object-diff'
import PouchDB from 'pouchdb-browser'
import memoryAdapter from 'pouchdb-adapter-memory'
import auth from 'pouchdb-authentication'
import hoodieApi from 'pouchdb-hoodie-api'

import { createExtraArgument, createStoreCore } from './store/configureStore'
import { signInStatus } from './bundles/account'
import { isSignedIn } from './actions/viewerAccount'

PouchDB.plugin(memoryAdapter)
PouchDB.plugin(auth)
PouchDB.plugin(hoodieApi)

let counter = 0
export function createUniqueDb (
  name: string,
  options?: PouchDB.MemoryAdapter.MemoryAdapterConfiguration
) {
  return new PouchDB(name + (counter++), {
    ...(options || {}),
    adapter: 'memory'
  })
}

/**
 * Different states the App can be in.
 * Used to set the starting state from the TestStore.
 */
export enum AppState {
  /** Default start state. No user is logged in. */
  LoggedOff,
  /** A user is logged in, but not unlocked. */
  LoggedIn,
  /** A user is logged in and the App was unlocked */
  Unlocked
}

/**
 * Create a store and some helper functions for testing actions.
 */
export async function createTestStore ({ localDB, remoteDB, state = AppState.LoggedOff }: {
  localDB: PouchDB.Database,
  remoteDB?: PouchDB.Database,
  state?: AppState
}) {
  let isSetup = true // when the the create Databases callback is called the first time
  const extraArgument = createExtraArgument(({ local, remote }: {
    local?: boolean,
    remote?: string,
    skipSetup?: boolean
  }) => {
    const result: { local: PouchDB.Database | null, remote: PouchDB.Database | null } = {
      local: null,
      remote: null
    }
    if (isSetup && state === AppState.LoggedOff) {
      isSetup = false
      return {
        local: localDB,
        remote: remoteDB ?? createUniqueDb('remote')
      }
    }

    if (local) {
      result.local = createUniqueDb('local')
    }
    if (remote) {
      result.remote = createUniqueDb('remote')
    }

    // create the session mock
    if (isSetup) {
      isSetup = false
      const getSession = jest.fn()
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
      result.remote!.getSession = getSession
    }
    return result
  })

  // Create the actual store
  const store = createStoreCore(undefined, extraArgument)

  // Set the app state
  if (state !== AppState.LoggedOff) {
    await setStateToLoggedin(state, store, extraArgument)
  }

  // Setup the state diffing
  const initialState = store.getState()
  const states = new Map<string, ReturnType<typeof store.getState>>()

  // Saves the current state under that key for later comparison
  const setMark = (key: string) => {
    states.set(key, store.getState())
  }

  // Get the diff from one state to another (default the current)
  const getDiff = (startKey?: string, endKey?: string) => {
    if (startKey && !states.has(startKey)) {
      throw new Error(`unknown start key '${startKey}'`)
    }
    if (endKey && !states.has(endKey)) {
      throw new Error(`unknown end key '${endKey}'`)
    }

    const oldState = startKey ? states.get(startKey)! : initialState
    const newerState = endKey ? states.get(endKey)! : store.getState()
    return getObjDiff(oldState, newerState)
  }

  return {
    store,
    cryptoStore: extraArgument.cryptoStore,
    setMark,
    getDiff,
    getCurrentDbs () {
      return { local: extraArgument.db, remote: extraArgument.remoteDB }
    }
  }
}

/**
 * Sets the initial state of the test-store to logged in, but not unlocked.
 */
async function setStateToLoggedin (
  state: AppState,
  store: ReturnType<typeof createStoreCore>,
  extraArgument: ReturnType<typeof createExtraArgument>
) {
  if (state === AppState.LoggedOff) return

  await extraArgument.db.put({
    _id: '_local/account',
    accountId: '6197db66-7452-47d6-bf47-85cfd71a2c71',
    name: 'tester.mactestface@example.com'
  })
  await extraArgument.cryptoStore.setup('testPassword')
  await store.dispatch(isSignedIn())

  if (state !== AppState.LoggedIn) {
    await setStateToUnlocked(state, store, extraArgument)
  }
}

/**
 * Sets the initial state of the test-store to logged in and unlocked.
 *
 * This _must_ be called from `setStateToLoggedin`!
 */
async function setStateToUnlocked (
  _state: AppState,
  store: ReturnType<typeof createStoreCore>,
  extraArgument: ReturnType<typeof createExtraArgument>
) {
  await extraArgument.cryptoStore.unlock('testPassword')
  await store.dispatch(signInStatus(true, true, 'tester.mactestface@example.com'))
}
