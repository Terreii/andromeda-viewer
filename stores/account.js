'use strict'

import { Map } from 'immutable'

const defaultData = {
  avatarName: '',
  loggedIn: false,
  sync: false,
  viewerAccount: {
    loggedIn: false,
    name: ''
  }
}

export default function accountStore (state = Map(defaultData), action) {
  switch (action.type) {
    case 'didLogin':
      return (state
        .set('avatarName', action.name.getName())
        .set('loggedIn', true))
    default:
      return state
  }
}
