/*
 * Stores all friends and their rights
 */

import Immutable from 'immutable'

function parseRights (rights) {
  const canModifyObjects = (rights & (1 << 2)) !== 0
  const canSeeOnMap = (rights & (1 << 1)) !== 0
  const canSeeOnline = (rights & (1 << 0)) !== 0
  return Immutable.Map({
    canSeeOnline: canSeeOnline,
    canSeeOnMap: canSeeOnMap,
    canModifyObjects: canModifyObjects
  })
}

function parseFriendsList (state, friend) {
  const rightsGiven = friend['buddy_rights_given'] // from me to friend
  const rightsHas = friend['rights_has'] // Friend has given me rights

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

    case 'ChangeUserRights':
      return state.map(friend => {
        const friendId = friend.get('id')

        // your friend updated the rights
        if (action.msg.fromId === friendId) {
          for (const user of action.msg.userRights) {
            if (user.agentId === action.msg.ownId) { // if it is yourself
              return friend.set('rightsHas', parseRights(user.rights))
            }
          }
        }

        // your update
        if (action.msg.fromId === action.msg.ownId) {
          for (const user of action.msg.userRights) {
            if (user.agentId === friendId) {
              return friend.set('rightsGiven', parseRights(user.rights))
            }
          }
        }

        return friend
      })

    default:
      return state
  }
}
