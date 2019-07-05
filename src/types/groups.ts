// Types for groups

export interface Group {
  id: string
  name: string
  insigniaID: string
  title: string
  acceptNotices: boolean
  listInProfile: boolean
  powers: Buffer
  sessionStarted: boolean
}
