import { combineReducers } from '@reduxjs/toolkit'
import { reducer as burgerMenu } from 'redux-burger-menu'

import account from './account'
import friends from './friends'
import groups from './groups'
import IMReducer from './IMReducer'
import inventory from './inventory'
import localChatReducer from './localChatReducer'
import names from './names'
import notifications from './notifications'
import region from './region'
import sessionReducer from './sessionReducer'

const rootReducer = combineReducers({
  account,
  burgerMenu,
  friends,
  groups,
  IMs: IMReducer,
  inventory,
  localChat: localChatReducer,
  names,
  notifications,
  region,
  session: sessionReducer
})

export default rootReducer
