'use strict'

import { createStore, combineReducers } from 'redux'

import { localChatStore } from './localChatStore'
import IMStore from './IMStore'
import { nameStoreReduce } from './nameStore'

export default createStore(combineReducers({
  localChat: localChatStore,
  IMs: IMStore,
  names: nameStoreReduce
}))