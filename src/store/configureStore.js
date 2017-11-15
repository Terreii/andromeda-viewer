import Hoodie from '@hoodie/client'
import PouchDB from 'pouchdb'
import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'

import rootReducer from '../reducers'

const hoodie = new Hoodie({
  url: '',
  PouchDB
})

// For development
// use with https://github.com/zalmoxisus/redux-devtools-extension
window.devHoodie = hoodie
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

// Create Redux-Store with Hoodie
const configureStore = preloadedState => {
  const store = createStore(
    rootReducer,
    preloadedState,
    composeEnhancers(
      applyMiddleware(
        thunkMiddleware.withExtraArgument({
          hoodie,
          circuit: null // will be set on login
        })
      )
    )
  )

  if (process.env.NODE_ENV !== 'production') {
    if (module.hot) {
      // Enable Webpack hot module replacement for reducers
      module.hot.accept('../reducers', () => {
        store.replaceReducer(rootReducer)
      })
    }
  }

  return store
}

export default configureStore
