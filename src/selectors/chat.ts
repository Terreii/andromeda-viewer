// Selectors for chat (local chat and IMs)

import { createSelector } from 'reselect'

import { getIsSignedIn, getShouldSync } from './viewer'

// Local chat
export enum LocalChatSourceType {
  System = 0,
  Agent = 1,
  Object = 2,
}

export enum LocalChatType {
  Whisper = 0,
  Normal = 1,
  Shout = 2,
  Say = 3,
  StartTyping = 4,
  StopTyping = 5,
  Debug = 6,
  OwnerSay = 8,
}

export enum LocalChatAudible {
  Not = -1,
  Barely = 0,
  Fully = 1,
}

export interface LocalChatMessage {
  _id: string
  _rev?: string
  fromName: string
  sourceID: string
  sourceType: LocalChatSourceType
  chatType: LocalChatType
  audible: LocalChatAudible
  position: [number, number, number]
  message: string
  time: number
  didSave: boolean
}

// IMs
export interface IMChat {
  _id: string
  _rev?: string
  didSaveChatInfo: boolean
  chatUUID: string
  saveId: string
  type: 'personal' | 'group' | 'conference'
  withId: string
  name: string
  didLoadHistory: boolean
  isLoadingHistory: boolean
  active: boolean
  hasUnsavedMSG: boolean
  messages: InstanceMessage[]
}

export enum IMDialog {
  MessageFromAgent = 0,
  MessageBox = 1,
  // DeprecatedMessageBoxCountdown = 2,
  GroupInvitation = 3,
  InventoryOffered = 4,
  InventoryAccepted = 5,
  InventoryDeclined = 6,
  GroupVote = 7,
  DeprecatedGroupMessage = 8,
  TaskInventoryOffered = 9,
  TaskInventoryAccepted = 10,
  TaskInventoryDeclined = 11,
  NewUserDefault = 12,
  SessionAdd = 13,
  SessionOfflineAdd = 14,
  SessionGroupStart = 15,
  SessionCardlessStart = 16,
  SessionSend = 17,
  SessionDrop = 18,
  MessageFromObject = 19,
  BusyAutoResponse = 20,
  ConsoleAndChatHistory = 21,
  RequestTeleport = 22,
  AcceptTeleport = 23,
  DenyTeleport = 24,
  GodLikeRequestTeleport = 25,
  RequestLure = 26,
  DeprecatedGroupElection = 27,
  GotoUrl = 28,
  Session911Start = 29,
  Lure911 = 30,
  FromTaskAsAlert = 31,
  GroupNotice = 32,
  GroupNoticeInventoryAccepted = 33,
  GroupNoticeInventoryDeclined = 34,
  GroupInvitationAccept = 35,
  GroupInvitationDecline = 36,
  GroupNoticeRequested = 37,
  FriendshipOffered = 38,
  FriendshipAccepted = 39,
  FriendshipDeclined = 40,
  StartTyping = 41,
  StopTyping = 42,
}

export interface InstanceMessage {
  _id: string
  _rev?: string
  hoodie?: any
  dialog: IMDialog
  fromId: string
  fromAgentName: string
  message: string
  time: number
  binaryBucket?: Buffer
}

export const getLocalChat = (state: any): LocalChatMessage[] => state.localChat

export const getIMChats = (state: any): { [key: string]: IMChat } => state.IMs

export const getActiveIMChats = createSelector(
  [
    getIMChats
  ],
  chats => Object.values(chats).filter(chat => chat.active)
)

// checks if the chat history should be saved and synced
export const getShouldSaveChat = createSelector(
  [
    getShouldSync,
    getIsSignedIn
  ],
  (sync, isSignedIn) => sync && isSignedIn
)
