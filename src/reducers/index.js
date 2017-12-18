import {combineReducers} from 'redux'
import {reducer as burgerMenu} from 'redux-burger-menu'

import account from './account'
import friendsReducer from './friendsReducer'
import IMReducer from './IMReducer'
import localChatReducer from './localChatReducer'
import namesCoreReducer from './nameReducer'
import sessionReducer from './sessionReducer'

const rootReducer = combineReducers({
  account,
  burgerMenu,
  friends: friendsReducer,
  IMs: IMReducer,
  localChat: localChatReducer,
  names: namesCoreReducer,
  session: sessionReducer
})

export default rootReducer
