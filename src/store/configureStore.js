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
    }
  })

  const store = configureStore({
    reducer: rootReducer,
    middleware,
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
    window.devStore = store
  }

  configureReactors(store)

  return store
}
