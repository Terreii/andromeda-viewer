import { configureStore, getDefaultMiddleware, isPlain } from '@reduxjs/toolkit'

import rootReducer from '../bundles'
import configureReactors from './configureReactors'
import { createLocalDB, createCryptoStore, createRemoteDB } from './db'
import { proxyFetch, fetchLLSD } from './llsdFetch'

import AvatarName from '../avatarName'

/**
 * Create Redux-Store with local db, remote db and more.
 */
export default function createStore (preloadedState) {
  const db = createLocalDB()
  const remoteDB = createRemoteDB('_users')

  const extraArgument = createExtraArgument(db, remoteDB)
  const store = createStoreCore(preloadedState, extraArgument)

  extraArgument.proxyFetch = proxyFetch.bind(null, store.getState)
  extraArgument.fetchLLSD = fetchLLSD.bind(null, store.getState)

  configureReactors(store)

  if (process.env.NODE_ENV !== 'production') {
    window.devStore = store
    window.localDB = extraArgument.db
    window.remoteDB = extraArgument.remoteDB
    window.cryptoStore = extraArgument.cryptoStore

    if (module.hot) {
      // Enable Webpack hot module replacement for reducers
      module.hot.accept('../bundles', () => {
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
export function createExtraArgument (localDB, remoteDB) {
  const extraArgument = {
    cryptoStore: createCryptoStore(localDB),
    db: localDB,
    remoteDB,
    proxyFetch: null, // Must be added after the store was created
    fetchLLSD: null, // Must be added after the store was created
    onAvatarLogout: [],
    circuit: null // will be set on login
  }
  return extraArgument
}

/**
 * Core of the store creation.
 */
export function createStoreCore (preloadedState, extraArgument) {
  const middleware = getDefaultMiddleware({
    thunk: {
      extraArgument
    },
    // Allow Uint8Array (Buffer) and AvatarName to be in actions and the state.
    serializableCheck: {
      isSerializable: value => isPlain(value) ||
        value instanceof Uint8Array ||
        value instanceof AvatarName
    }
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
