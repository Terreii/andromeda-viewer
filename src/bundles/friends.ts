/*
 * Reduces all friends and their rights
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { login, logout, userWasKicked, LoginAction } from './session'

import { getValueOf, mapBlockOf } from '../network/msgGetters'

import { Friend } from '../types/people'

export type FriendOnlineStateAction = PayloadAction<{
  friends: { id: string, showNotification: boolean }[],
  online: boolean
}>

const friendsSlice = createSlice({
  name: 'friends',

  initialState: [] as Friend[],

  reducers: {
    changeRights: {
      reducer (state, action: PayloadAction<ChangedUserRightsAction, string>) {
        const changed = new Map<string, ChangedUserRights>()

        for (const user of action.payload.changed) {
          changed.set(user.agentId, user)
        }

        for (const friend of state) {
          // your update the rights
          if (action.payload.fromId === action.payload.ownId && changed.has(friend.id)) {
            friend.rightsGiven = parseRights(changed.get(friend.id)!.rights)
            continue
          }

          // your friend updated the rights
          if (action.payload.fromId === friend.id && changed.has(action.payload.ownId)) {
            // if it is yourself
            friend.rightsHas = parseRights(changed.get(action.payload.ownId)!.rights)
          }
        }
      },

      prepare (message: any, ownId: string) {
        const rights = mapBlockOf(message, 'Rights', (getValue: (arg: string) => any) => {
          return {
            agentId: getValue('AgentRelated'),
            rights: getValue('RelatedRights')
          }
        })
        return {
          payload: {
            changed: rights as { agentId: string, rights: number }[],
            ownId,
            fromId: getValueOf(message, 'AgentData', 'AgentID') as string
          }
        }
      }
    },

    onlineStateChanged (state, action: FriendOnlineStateAction) {
      const friends = new Map(state.map((friend, index) => [friend.id, index]))

      for (const friend of action.payload.friends) {
        if (friends.has(friend.id)) {
          const index = friends.get(friend.id)!
          state[index].online = action.payload.online
        }
      }
    }
  },

  extraReducers: {
    [login.type] (state, action: PayloadAction<LoginAction>) {
      // If a avatar has no buddies, then the buddy-list doesn't exist!
      if (!Array.isArray(action.payload.sessionInfo['buddy-list'])) return state
  
      return action.payload.sessionInfo['buddy-list'].map(friend => {
        const rightsGiven = friend.buddy_rights_given // from me to friend
        const rightsHas = friend.buddy_rights_has // Friend has given me rights
  
        return {
          id: friend.buddy_id,
          online: false,
          rightsGiven: parseRights(rightsGiven), // Rights you have given to friend
          rightsHas: parseRights(rightsHas) // Rights friend has given you
        }
      })
    },

    [logout.type]: () => [],
    [userWasKicked.type]: () => []
  }
})

export default friendsSlice.reducer

export const { changeRights, onlineStateChanged } = friendsSlice.actions

// selectors
export const selectFriends = (state: any): Friend[] => state.friends

export const selectFriendById = (state: any, id: string) => selectFriends(state)
  .find(friend => friend.id === id)

// Helpers

function parseRights (rights: number) {
  return {
    canSeeOnline: (rights & (1 << 0)) !== 0,
    canSeeOnMap: (rights & (1 << 1)) !== 0,
    canModifyObjects: (rights & (1 << 2)) !== 0
  }
}

// Types

interface ChangedUserRights {
  agentId: string,
  rights: number
}

interface ChangedUserRightsAction {
  changed: ChangedUserRights[]
  ownId: string
  fromId: string
}
