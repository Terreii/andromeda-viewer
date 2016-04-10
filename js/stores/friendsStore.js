'use strict'

/*
 * Stores all friends and their rights
 */

const ReduceStore = require('flux/utils').ReduceStore
const Immutable = require('immutable')

const Dispatcher = require('../uiDispatcher')

class TodoStore extends ReduceStore {
  getInitialState () {
    return Immutable.List()
  }

  reduce (stateOld, payload) {
    switch (payload.actionType) {
      case 'friendsInit':
        return payload.friends.reduce((state, friend) => {
          const rightsGiven = friend['buddy_rights_given']
          const rightsHas = friend['rights_has']
          const parseRights = (rights) => {
            var canModifyObjects = false
            if (rights >= 4) {
              rights -= 4
              canModifyObjects = true
            }
            var canSeeOnMap = false
            if (rights >= 2) {
              rights -= 2
              canSeeOnMap = true
            }
            var canSeeOnline = false
            if (rights >= 1) {
              rights -= 1
              canSeeOnline = true
            }
            return Immutable.Map({
              canSeeOnline: canSeeOnline,
              canSeeOnMap: canSeeOnMap,
              canModifyObjects: canModifyObjects
            })
          }
          return state.push(Immutable.Map({
            id: friend['buddy_id'],
            rightsGivenNum: rightsGiven,
            rightsGiven: parseRights(rightsGiven),
            rightsHasNum: rightsHas,
            rightsHas: parseRights(rightsHas)
          }))
        }, stateOld)

      default:
        return stateOld
    }
  }
}

module.exports = new TodoStore(Dispatcher)
