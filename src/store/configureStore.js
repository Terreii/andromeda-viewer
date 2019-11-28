import { configureStore, getDefaultMiddleware, isPlain } from '@reduxjs/toolkit'

import rootReducer from '../reducers'
import configureReactors from './configureReactors'

import AvatarName from '../avatarName'

// Create Redux-Store with Hoodie
export default function (preloadedState) {
  // Bind Hoodie to the store
  const middleware = getDefaultMiddleware({
    thunk: {
      extraArgument: {
        hoodie: window.hoodie,
        circuit: null // will be set on login
      }
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

  if (process.env.NODE_ENV !== 'production') {
    if (module.hot) {
      // Enable Webpack hot module replacement for reducers
      module.hot.accept('../reducers', () => {
        store.replaceReducer(rootReducer)
      })
    }
  }

  configureReactors(store)

  return store
}
