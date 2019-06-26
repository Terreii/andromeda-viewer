// Selectors for friends and other people

export interface FriendRights {
  canSeeOnline: boolean
  canSeeOnMap: boolean
  canModifyObjects: boolean
}

export interface Friend {
  id: string
  // from me to friend
  rightsGiven: FriendRights
  // Friend has given me rights
  rightsHas: FriendRights
}

export const getFriends = (state: any): Friend[] => state.friends

export const getFriendById = (state: any, id: string) => getFriends(state)
  .find(friend => friend.id === id)
