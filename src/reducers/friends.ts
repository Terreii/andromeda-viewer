/*
 * Reduces all friends and their rights
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { login, logout, userWasKicked, LoginAction } from './session'

import { getValueOf, mapBlockOf } from '../network/msgGetters'

import { Friend } from '../types/people'

const friendsSlice = createSlice({
  name: 'friends',

  initialState: [] as Friend[],

  reducers: {
    changeRights: {
      reducer (state, action: PayloadAction<ChangedUserRights[], string, ChangedUserRightsMeta>) {
        type ChangedMap = { [key: string]: ChangedUserRights }

        const changed = action.payload.reduce((all: ChangedMap, user) => {
          all[user.agentId] = user
          return all
        }, {})

        for (const friend of state) {
          // your update the rights
          if (action.meta.fromId === action.meta.ownId && friend.id in changed) {
            friend.rightsGiven = parseRights(changed[friend.id].rights)
            continue
          }

          // your friend updated the rights
          if (action.meta.fromId === friend.id && action.meta.ownId in changed) {
            friend.rightsHas = parseRights(changed[action.meta.ownId].rights) // if it is yourself
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
          payload: rights,
          meta: {
            ownId,
            fromId: getValueOf(message, 'AgentData', 'AgentID') as string
          }
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

export const { changeRights } = friendsSlice.actions

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

interface ChangedUserRightsMeta {
  ownId: string,
  fromId: string
}

interface ChangedUserRights {
  agentId: string,
  rights: number
}
