import { configureStore, getDefaultMiddleware, isPlain } from '@reduxjs/toolkit'

import rootReducer from '../bundles'
import configureReactors from './configureReactors'
import { createLocalDB, createCryptoStore, createRemoteDB } from './db'
import { proxyFetch, fetchLLSD } from './llsdFetch'

import AvatarName from '../avatarName'

// Create Redux-Store with local db, remote db and more
export default function (preloadedState) {
  const db = createLocalDB()
  const extraArgument = {
    cryptoStore: createCryptoStore(db),
    db,
    remoteDB: createRemoteDB('_users'),
    proxyFetch: null,
    fetchLLSD: null,
    onAvatarLogout: [],
    circuit: null // will be set on login
  }

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

  extraArgument.proxyFetch = proxyFetch.bind(null, store.getState)
  extraArgument.fetchLLSD = fetchLLSD.bind(null, store.getState)

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

  configureReactors(store)

  return store
}
