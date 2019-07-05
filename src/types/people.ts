// Types for People and Names

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
