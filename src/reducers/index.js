import { combineReducers } from 'redux'

import account from '../reducers/account'
import localChatReducer from '../reducers/localChatReducer'
import IMReducer from '../reducers/IMReducer'
import namesCoreReducer from '../reducers/nameReducer'
import friendsReducer from '../reducers/friendsReducer'

const rootReducer = combineReducers({
  account,
  localChat: localChatReducer,
  IMs: IMReducer,
  names: namesCoreReducer,
  friends: friendsReducer
})

export default rootReducer
