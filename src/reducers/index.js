import { combineReducers } from '@reduxjs/toolkit'
import { reducer as burgerMenu } from 'redux-burger-menu'

import account from './account'
import friendsReducer from './friendsReducer'
import groups from './groups'
import IMReducer from './IMReducer'
import inventory from './inventory'
import localChatReducer from './localChatReducer'
import namesCoreReducer from './nameReducer'
import notifications from './notifications'
import sessionReducer from './sessionReducer'

const rootReducer = combineReducers({
  account,
  burgerMenu,
  friends: friendsReducer,
  groups,
  IMs: IMReducer,
  inventory,
  localChat: localChatReducer,
  names: namesCoreReducer,
  notifications,
  session: sessionReducer
})

export default rootReducer
