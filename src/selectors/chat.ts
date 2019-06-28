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
  /**
   * A normal message from an other avatar.
   */
  MessageFromAgent = 0,
  /**
   * A simple notification box with an OK button.
   */
  MessageBox = 1,
  /**
   * Used to show a countdown notification with an OK button.
   * @deprecated
   */
  DeprecatedMessageBoxCountdown = 2,
  /**
   * You got invited to join a group.
   * ID is the group ID.
   * The binary bucket contains a C-string.
   * The first char represent the officer/member status, and the rest represent the join cost.
   */
  GroupInvitation = 3,
  /**
   * Inventory Offer.
   * The ID is the transaction id.
   * The binary bucket is a list of inventory UUID and type.
   */
  InventoryOffered = 4,
  /**
   * Accepted inventory offer.
   */
  InventoryAccepted = 5,
  /**
   * Declined inventory offer.
   */
  InventoryDeclined = 6,
  /**
   * Group vote.
   * Name if from the avatar that started the vote.
   * ID is the transaction id.
   */
  GroupVote = 7,
  /**
   * Message to all members of a group.
   * @deprecated It started an IM-Session with all members!
   */
  DeprecatedGroupMessage = 8,
  /**
   * An object is offering its inventory.
   * ID is the transaction id.
   * Binary bucket is a inventory type.
   */
  TaskInventoryOffered = 9,
  /**
   * Accept an inventory offer from an object.
   */
  TaskInventoryAccepted = 10,
  /**
   * Decline an inventory offer from an object.
   */
  TaskInventoryDeclined = 11,
  /**
   * {@link IMDialog.MessageFromAgent}
   */
  NewUserDefault = 12,
  /**
   * Start a session, or add an avatar to a session.
   */
  SessionAdd = 13,
  /**
   * Start a session, but don't prune offline users.
   */
  SessionOfflineAdd = 14,
  /**
   * Start a group-session.
   */
  SessionGroupStart = 15,
  /**
   * Start a session without a calling card.
   */
  SessionCardlessStart = 16,
  /**
   * Send a message to a session (group or to other avatars).
   */
  SessionSend = 17,
  /**
   * Leave a session.
   */
  SessionDrop = 18,
  /**
   * Message from an object.
   * You can't answer.
   */
  MessageFromObject = 19,
  /**
   * Response from a busy user.
   */
  BusyAutoResponse = 20,
  /**
   * Shows the message in the console and chat history.
   */
  ConsoleAndChatHistory = 21,
  /**
   * Send a teleport lure.
   */
  RequestTeleport = 22,
  /**
   * Accept a teleport lure.
   */
  AcceptTeleport = 23,
  /**
   * Deny a teleport lure.
   */
  DenyTeleport = 24,
  /**
   * A linden will teleport you.
   */
  GodLikeRequestTeleport = 25,
  /**
   * Request a teleport lure {@link IMDialog.RequestTeleport}.
   */
  RequestLure = 26,
  /**
   * Notification of a new group election.
   * @deprecated
   */
  DeprecatedGroupElection = 27,
  /**
   * IM to tell the user to go to an URL.
   * Message is the info text.
   * Binary bucket contains the URL.
   */
  GotoUrl = 28,
  /**
   * IM for help.
   */
  Session911Start = 29,
  /**
   * IM sent automatically on call for help, sends a lure to each Helper reached.
   */
  Lure911 = 30,
  /**
   * IM from an object.
   * Like an IM but won't go to email.
   */
  FromTaskAsAlert = 31,
  /**
   * IM from a group officer to all group members.
   */
  GroupNotice = 32,
  GroupNoticeInventoryAccepted = 33,
  GroupNoticeInventoryDeclined = 34,
  /**
   * Accept a group invitation.
   */
  GroupInvitationAccept = 35,
  /**
   * Decline a group invitation.
   */
  GroupInvitationDecline = 36,
  /**
   * Unknown
   */
  GroupNoticeRequested = 37,
  /**
   * An avatar is offering you friendship.
   */
  FriendshipOffered = 38,
  /**
   * An avatar has accepted your friendship offer.
   */
  FriendshipAccepted = 39,
  /**
   * An avatar has declined your friendship offer.
   */
  FriendshipDeclined = 40,
  /**
   * Indicates that a user has started typing.
   */
  StartTyping = 41,
  /**
   * Indicates that a user has stopped typing.
   */
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
