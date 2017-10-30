'use strict'

/*
 * Stores all friends and their rights
 */

import Immutable from 'immutable'

function parseFriendsList (state, friend) {
  const rightsGiven = friend['buddy_rights_given'] // from me to friend
  const rightsHas = friend['rights_has'] // Friend has given me rights

  const parseRights = rights => {
    const canModifyObjects = (rights & 1 << 2) !== 0
    const canSeeOnMap = (rights & 1 << 1) !== 0
    const canSeeOnline = (rights & 1 << 0) !== 0
    return Immutable.Map({
      canSeeOnline: canSeeOnline,
      canSeeOnMap: canSeeOnMap,
      canModifyObjects: canModifyObjects
    })
  }

  const data = {
    id: friend['buddy_id'],
    rightsGiven: parseRights(rightsGiven), // Rights you have given to friend
    rightsHas: parseRights(rightsHas) // Rights friend has given you
  }
  return state.push(Immutable.Map(data))
}

export default function friendsStore (state = Immutable.List(), action) {
  switch (action.type) {
    case 'didLogin':
      return action.buddyList.reduce(parseFriendsList, state)
    default:
      return state
  }
}
