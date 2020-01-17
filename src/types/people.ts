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

export enum TeleportFlags {
  /** No flags set, or teleport failed */
  default = 0,
  /** Set when a newbie leaves help island for the first time */
  setHomeToTarget = 1 << 0,
  /** Unknown */
  setLastToTarget = 1 << 1,
  viaLure = 1 << 2,
  viaLandmark = 1 << 3,
  viaLocation = 1 << 4,
  viaHome = 1 << 5,
  viaTelehub = 1 << 6,
  viaLogin = 1 << 7,
  /** Linden did send a lure */
  viaGodLikeLure = 1 << 8,
  /** Linden forced teleport */
  godLike = 1 << 9,
  nineOneOne = 1 << 10,
  /** A script did teleport the agent hone */
  disableCancel = 1 << 11,
  viaRegionId = 1 << 12,
  isFlying = 1 << 13,
  resetHome = 1 << 14,
  /** 
   * Forced to a new location.
   * 
   * This can happen for example if the avatar is banned or ejected.
   */
  forceRedirect = 1 << 15,
  /** Teleport did finish via a lure. */
  finishedViaLure = 1 << 26,
  /** Finished and Sim was changed. */
  finishedViaNewSim = 1 << 28,
  /** Finished and Sim was not changed. */
  finishedViaSameSim = 1 << 29
}

export interface Group {
  /**
  * UUID of the group.
  */
  id: string
  /**
  * Name of the group.
  */
  name: string
  /**
  * UUID of the insignia (group picture).
  */
  insigniaID: string
  /**
  * Current title of the avatar.
  */
  title: string
  /**
  * Will the avatar receive group notifications.
  */
  acceptNotices: boolean
  /**
  * Is this group listed in the avatar profile.
  */
  listInProfile: boolean
  /**
  * 64Uint list of powers the user has. Stored bitwise.
  */
  powers: Buffer
  /**
  * The group chat session was started.
  */
  sessionStarted: boolean
}
