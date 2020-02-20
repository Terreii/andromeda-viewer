import { configureStore, getDefaultMiddleware, isPlain } from '@reduxjs/toolkit'

import rootReducer from '../bundles'
import configureReactors from './configureReactors'
import { proxyFetch, fetchLLSD } from './llsdFetch'

import AvatarName from '../avatarName'

// Create Redux-Store with Hoodie
export default function (preloadedState) {
  const extraArgument = {
    hoodie: window.hoodie,
    proxyFetch: null,
    fetchLLSD: null,
    circuit: null // will be set on login
  }

  // Bind Hoodie to the store
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
