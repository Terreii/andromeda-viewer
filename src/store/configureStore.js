import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'

import rootReducer from '../reducers'

// Create Redux-Store with Hoodie
const configureStore = preloadedState => {
  const middleware = applyMiddleware(
    thunkMiddleware.withExtraArgument({
      hoodie: window.hoodie,
      handlersUnsubscribe: [], // will contain function, that should will unsubscribe handlers
      //                          that shouldn't listen after sign out
      circuit: null // will be set on login
    })
  )

  // For development
  // use with https://github.com/zalmoxisus/redux-devtools-extension
  const enhancers = process.env.NODE_ENV !== 'production'
    ? (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose)(middleware)
    : middleware

  const store = createStore(
    rootReducer,
    preloadedState,
    enhancers
  )

  if (process.env.NODE_ENV !== 'production') {
    if (module.hot) {
      // Enable Webpack hot module replacement for reducers
      module.hot.accept('../reducers', () => {
        store.replaceReducer(rootReducer)
      })
    }
    window.devStore = store
  }

  return store
}

export default configureStore
