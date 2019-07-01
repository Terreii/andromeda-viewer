// Types for viewer types

export interface HoodieTimeObject {
  createdAt: string
  updatedAt?: string
  deletedAt?: string
}

export interface AvatarData {
  name: string
  grid: string
  avatarIdentifier: string
  dataSaveId: string
}

export interface SavedAvatarData extends AvatarData {
  _id: string
  _rev: string
  _deleted?: boolean
  hoodie: HoodieTimeObject
}

export interface Grid {
  _id: string
  _rev: string
  _deleted?: boolean
  hoodie: HoodieTimeObject
  name: string
  loginURL: string
}
