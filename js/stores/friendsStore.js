'use strict'

/*
 * Stores all friends and their rights
 */

var ReduceStore = require('flux/utils').ReduceStore
var Immutable = require('immutable')

var Dispatcher = require('../uiDispatcher')

class TodoStore extends ReduceStore {
  getInitialState () {
    return Immutable.List()
  }

  reduce (state, payload) {
    switch (payload.actionType) {
      case 'friendsInit':
        return payload.friends.reduce((stateAll, friend) => {
          return state.push(Immutable.Map({
            id: friend['buddy_id'],
            rightsGiven: friend['buddy_rights_given'],
            rightsHas: friend['rights_has']
          }))
        }, state)

      default:
        return state
    }
  }
}

module.exports = new TodoStore(Dispatcher)
