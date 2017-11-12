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
export default createStore(rootReducer, composeEnhancers(applyMiddleware(
  thunkMiddleware.withExtraArgument({
    hoodie,
    circuit: null // will be set on login
  })
)))
