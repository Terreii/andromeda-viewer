'use strict'

import { createStore, combineReducers } from 'redux'

import { localChatStore } from './localChatStore'

export default createStore(combineReducers({
  localChat: localChatStore
}))
