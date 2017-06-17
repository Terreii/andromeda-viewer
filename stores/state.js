'use strict'

import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'

import account from './account'
import { localChatStore } from './localChatStore'
import IMStore from './IMStore'
import { nameStoreReduce } from './nameStore'

const rootReducer = combineReducers({
  account,
  localChat: localChatStore,
  IMs: IMStore,
  names: nameStoreReduce
})

export default createStore(rootReducer, applyMiddleware(
  thunkMiddleware.withExtraArgument(window.hoodie)
))
