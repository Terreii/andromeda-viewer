'use strict'

const Dispatcher = require('../uiDispatcher')

module.exports = {
  initFriends: (friendsList) => {
    Dispatcher.dispatch({
      actionType: 'friendsInit',
      friends: friendsList
    })
  }
}
