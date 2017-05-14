'use strict'

import { createStore, combineReducers } from 'redux'

import account from './account'
import { localChatStore } from './localChatStore'
import IMStore from './IMStore'
import { nameStoreReduce } from './nameStore'

export default createStore(combineReducers({
  account,
  localChat: localChatStore,
  IMs: IMStore,
  names: nameStoreReduce
}))
