/*
 * Reduces all friends and their rights
 */

function parseRights (rights) {
  return {
    canSeeOnline: (rights & (1 << 0)) !== 0,
    canSeeOnMap: (rights & (1 << 1)) !== 0,
    canModifyObjects: (rights & (1 << 2)) !== 0
  }
}

export default function friendsReducer (state = [], action) {
  switch (action.type) {
    case 'didLogin':
      // If a avatar has no buddies, then the buddy-list doesn't exist!
      if (!Array.isArray(action.sessionInfo['buddy-list'])) return state

      return action.sessionInfo['buddy-list'].map(friend => {
        const rightsGiven = friend['buddy_rights_given'] // from me to friend
        const rightsHas = friend['rights_has'] // Friend has given me rights

        return {
          id: friend['buddy_id'],
          rightsGiven: parseRights(rightsGiven), // Rights you have given to friend
          rightsHas: parseRights(rightsHas) // Rights friend has given you
        }
      })

    case 'ChangeUserRights':
      const changed = action.userRights.reduce((all, user) => {
        all[user.agentId] = user
        return all
      }, {})

      return state.map(friend => {
        // your update the rights
        if (action.fromId === action.ownId && friend.id in changed) {
          return {
            ...friend,
            rightsGiven: parseRights(changed[friend.id].rights)
          }
        }

        // your friend updated the rights
        if (action.fromId === friend.id && action.ownId in changed) {
          return {
            ...friend,
            rightsHas: parseRights(changed[action.ownId].rights) // if it is yourself
          }
        }

        return friend
      })

    case 'DidLogout':
    case 'UserWasKicked':
      return []

    default:
      return state
  }
}
