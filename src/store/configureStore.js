import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'

import rootReducer from '../reducers'
import configureReactors from './configureReactors'

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
    // This check is disabled because Uint8Arrays are not serializable!
    serializableCheck: false
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
