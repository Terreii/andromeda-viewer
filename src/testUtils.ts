import { diff as getObjDiff } from 'deep-object-diff'
import PouchDB from 'pouchdb-browser'
import memoryAdapter from 'pouchdb-adapter-memory'
import auth from 'pouchdb-authentication'
import hoodieApi from 'pouchdb-hoodie-api'

import { createExtraArgument, createStoreCore } from './store/configureStore'

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
 * Create a store and some helper functions for testing actions.
 */
export function createTestStore ({ localDB, remoteDB }: {
  localDB: PouchDB.Database,
  remoteDB?: PouchDB.Database
}) {
  const extraArgument = createExtraArgument(localDB, remoteDB, ({ local, remote }: {
    local?: boolean,
    remote?: string,
    skipSetup?: boolean
  }) => {
    const result: { local: PouchDB.Database | null, remote: PouchDB.Database | null } = {
      local: null,
      remote: null
    }
    if (local) {
      result.local = createUniqueDb('local')
    }
    if (remote) {
      result.remote = createUniqueDb('remote')
    }
    return result
  })
  const store = createStoreCore(undefined, extraArgument)

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
