'use strict'

/*
 * Stores all friends and their rights
 */

import {ReduceStore} from 'flux/utils'
import Immutable from 'immutable'

import Dispatcher from '../network/uiDispatcher'

class TodoStore extends ReduceStore {
  getInitialState () {
    return Immutable.List()
  }

  reduce (stateOld, payload) {
    switch (payload.actionType) {
      case 'friendsInit':
        return payload.friends.reduce((state, friend) => {
          const rightsGiven = friend['buddy_rights_given'] // from me to friend
          const rightsHas = friend['rights_has'] // Friend has given me rights
          const parseRights = (rights) => {
            let canModifyObjects = false
            if (rights >= 4) {
              rights -= 4
              canModifyObjects = true
            }
            let canSeeOnMap = false
            if (rights >= 2) {
              rights -= 2
              canSeeOnMap = true
            }
            let canSeeOnline = false
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

export default new TodoStore(Dispatcher)
