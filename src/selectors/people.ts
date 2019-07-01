// Selectors for friends and other people

import { Friend } from '../types/people'

export const getFriends = (state: any): Friend[] => state.friends

export const getFriendById = (state: any, id: string) => getFriends(state)
  .find(friend => friend.id === id)
