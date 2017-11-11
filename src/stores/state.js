import Hoodie from '@hoodie/client'
import PouchDB from 'pouchdb'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'

import account from './account'
import { localChatStore } from './localChatStore'
import IMStore from './IMStore'
import { nameStoreReduce } from './nameStore'
import friendsStore from './friendsStore'
import sessionReducer from './sessionStore'

const rootReducer = combineReducers({
  account,
  localChat: localChatStore,
  IMs: IMStore,
  names: nameStoreReduce,
  friends: friendsStore,
  session: sessionReducer
})

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