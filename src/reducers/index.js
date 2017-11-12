import { combineReducers } from 'redux'

import account from '../reducers/account'
import localChatReducer from '../reducers/localChatReducer'
import IMReducer from '../reducers/IMReducer'
import namesCoreReducer from '../reducers/nameReducer'
import friendsReducer from '../reducers/friendsReducer'
import sessionReducer from '../stores/sessionStore'

const rootReducer = combineReducers({
  account,
  localChat: localChatReducer,
  IMs: IMReducer,
  names: namesCoreReducer,
  friends: friendsReducer,
  session: sessionReducer
})

export default rootReducer
