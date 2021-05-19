import {
  configureStore,
  getDefaultMiddleware,
  isPlain,
  ThunkAction,
  ThunkDispatch,
  Action,
  SerializableStateInvariantMiddlewareOptions
} from '@reduxjs/toolkit'

import rootReducer from '../bundles'
import configureReactors from './configureReactors'
import { createLocalDB, createCryptoStore, createRemoteDB } from './db'
import { proxyFetch, fetchLLSD } from './llsdFetch'

import AvatarName from '../avatarName'

export type AppDispatch = ThunkDispatch<RootState, ExtraArguments, Action<string>>
export type RootState = ReturnType<typeof rootReducer>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  ExtraArguments,
  Action<string>
>

export interface LLSDResponse extends Response {
  llsd: <T = any>() => Promise<T>
}

export interface ExtraArguments {
  cryptoStore: any,
  db: PouchDB.Database,
  remoteDB: PouchDB.Database | null,
  /**
   * Create the local and/or remote databases.
   */
  createDatabases: (args: CreateDatabasesArgs) => CreateDatabasesResult,
  /**
   * Fetch for grids.
   */
  proxyFetch: (url: string | URL, options?: RequestInit) => Promise<Response>,
  /**
   * Fetch for grids, but data is encoded in LLSD and a llsd decode function exists on return.
   */
  fetchLLSD: (url: string | URL, options?: RequestInit) => Promise<LLSDResponse>,
  /**
   * Functions which are called when an avatar logs out.
   */
  onAvatarLogout: (() => void)[],
  /**
   * null if no avatar is logged in.
   */
  circuit: any | null
}

export interface CreateDatabasesArgs {
  local?: boolean,
  remote?: string,
  skipSetup?: boolean
}
export interface CreateDatabasesResult {
  local: PouchDB.Database | null,
  remote: PouchDB.Database | null
}

/**
 * Create Redux-Store with local db, remote db and more.
 */
export default function createStore (preloadedState?: RootState) {
  const extraArgument = createExtraArgument(({ local, remote, skipSetup }) => {
    const result: CreateDatabasesResult = { local: null, remote: null }
    if (local) {
      result.local = createLocalDB()
    }
    if (remote) {
      result.remote = createRemoteDB(remote, skipSetup)
    }
    return result
  })
  const store = createStoreCore(preloadedState, extraArgument)

  extraArgument.proxyFetch = (url: string | URL, options?: RequestInit) => proxyFetch(
    store.getState,
    url,
    options
  )
  extraArgument.fetchLLSD = (url: string | URL, options?: RequestInit) => {
    const result = fetchLLSD(store.getState, url.toString(), options)
    return (result as any) as Promise<LLSDResponse>
  }

  configureReactors(store)

  if (process.env.NODE_ENV !== 'production') {
    ;(window as any)['devStore'] = store
    ;(window as any)['localDB'] = extraArgument.db
    ;(window as any)['remoteDB'] = extraArgument.remoteDB
    ;(window as any)['cryptoStore'] = extraArgument.cryptoStore

    if ((module as any).hot) {
      // Enable Webpack hot module replacement for reducers
      (module as any).hot.accept('../bundles', () => {
        store.replaceReducer(rootReducer)
      })
    }
  }

  return store
}

/**
 * Create the thunk extraArgument.
 * It adds the localDB and remoteDB to it, but does not setup proxyFetch or fetchLLSD.
 */
export function createExtraArgument (
  createDatabases: (args: CreateDatabasesArgs) => CreateDatabasesResult
): ExtraArguments {
  const { local, remote } = createDatabases({ local: true, remote: '_users', skipSetup: true })
  const extraArgument = {
    cryptoStore: createCryptoStore(local),
    db: local!,
    remoteDB: remote!,
    createDatabases,
    // Must be added after the store was created
    proxyFetch: () => Promise.reject(new Error('unimplemented')),
    // Must be added after the store was created
    fetchLLSD: () => Promise.reject(new Error('unimplemented')),
    onAvatarLogout: [],
    circuit: null // will be set on login
  }
  return extraArgument
}

/**
 * Core of the store creation.
 */
export function createStoreCore (
  preloadedState: RootState | undefined,
  extraArgument: ExtraArguments
) {
  const serializableCheck: SerializableStateInvariantMiddlewareOptions = {
    isSerializable: value => isPlain(value) ||
      value instanceof Uint8Array ||
      value instanceof AvatarName
  }
  const middleware = getDefaultMiddleware({
    thunk: {
      extraArgument
    },
    // Allow Uint8Array (Buffer) and AvatarName to be in actions and the state.
    serializableCheck
  })

  const store = configureStore({
    reducer: rootReducer,
    middleware,
    // enable devTools in development. Please use the Redux DevTools Extension
    // http://extension.remotedev.io/
    devTools: process.env.NODE_ENV !== 'production',
    preloadedState
  })

  return store
}
