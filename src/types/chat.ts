// Types for chat

import { HoodieObject, Maturity } from './viewer'
import { AssetType } from './inventory'

/**
 * This is a abstract base interface for LocalChat and IM
 */
export interface AbstractChatMessage extends HoodieObject {
  /**
   * UUID from the sending avatar or object.
   */
  fromId: string,
  /**
   * Name from the sender.
   */
  fromName: string,
  /**
   * The message.
   */
  message: string,
  /**
   * When it was send/received. It is a Date number.
   */
  time: number,
  /**
   * Was it saved?
   */
  didSave: boolean,
}

// Local chat
export enum LocalChatSourceType {
  /**
   * Chat from the grid or simulator.
   */
  System = 0,
  /**
   * Chat from another avatar.
   */
  Agent = 1,
  /**
   * Chat from an object.
   */
  Object = 2,
  /**
   * For all unknown sources.
   */
  Unknown = 3,
}

export enum LocalChatType {
  /**
   * 5m radius - "Test User whispers: message"
   */
  Whisper = 0,
  /**
   * 10/20m radius - "Test User: message"
   */
  Normal = 1,
  /**
   * 100m radius - "Test User shouts: message"
   */
  Shout = 2,
  /**
   * It is not known if this is used for anything - "Test User say, message"
   * 
   * It is undefined in the original viewer.
   */
  Say = 3,
  /**
   * Lets others know you are typing.
   */
  StartTyping = 4,
  /**
   * Lets others know you've stopped typing.
   */
  StopTyping = 5,
  /**
   * Chat from debug channel.
   */
  Debug = 6,
  /**
   * Private chat message from an object owned by you; this chat is only sent to you.
   */
  OwnerSay = 8,
  /**
   * Original Viewer uses this for their llRegionSayTo().
   */
  Direct = 9, 
}

export enum LocalChatAudible {
  /**
   * Is not audible at all.
   */
  Not = -1,
  /**
   * Is close to being out of range.
   */
  Barely = 0,
  /**
   * Is in range.
   */
  Fully = 1,
}

/**
 * Message send to the local chat.
 * 
 * It can be from an Avatar, the system or an object.
 */
export interface LocalChatMessage extends AbstractChatMessage {
  sourceType: LocalChatSourceType
  chatType: LocalChatType
  audible: LocalChatAudible
  /**
   * Id of the owner of the sending Object.
   * 
   * It is the save as sourceId/fromId if it is a avatar.
   * Then it will be removed while saving.
   */
  ownerId?: string
  /**
   * Position of the avatar.
   * 
   * This is never read in the official viewer.
   * 
   * It will be removed while saving.
   */
  position?: [number, number, number]
}

export interface NotificationInChat {
  text: string
  fromName: string
  fromId: string
  time: number
}

// IMs

export enum IMChatType {
  personal,
  group,
  conference
}

/**
 * Represents a conversation.
 * 
 * In messages are the IM stored.
 */
export interface IMChat extends HoodieObject {
  didSaveChatInfo: boolean,
  sessionId: string,
  saveId: string,
  type: IMChatType,
  target: string,
  name: string,
  didLoadHistory: boolean,
  isLoadingHistory: boolean,
  active: boolean,
  hasUnsavedMSG: boolean,
  areTyping: string[]
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
   * 
   * The ID is the transaction id.
   * The binary bucket is a list of inventory type and UUID (1 byte type and 16 byte UUID).
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
  TeleportLureOffered = 22,
  /**
   * Accept {@link IMDialog.TeleportLureOffered}.
   */
  AcceptTeleport = 23,
  /**
   * Deny {@link IMDialog.TeleportLureOffered}.
   */
  DenyTeleport = 24,
  /**
   * A linden will teleport you.
   */
  GodLikeTeleportLureOffered = 25,
  /**
   * Request a teleport lure {@link IMDialog.TeleportLureOffered}.
   */
  RequestTeleportLure = 26,
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

export interface InstantMessage extends AbstractChatMessage {
  offline?: number
}

// Notifications

/**
 * Abstract base interface for notifications.
 */
export interface NotificationBase {
  /**
   * Type to differentiate the notification types.
   * 
   * Every notification will have a specific type.
   */
  notificationType: NotificationTypes
  /**
   * Will be set in the reducer/store.
   * 
   * It is a avatar-session unique Id.
   */
  id?: number
  /**
   * Message send with the notification.
   */
  text: string
}

/**
 * A notification that will only show text.
 */
export interface TextNotification extends NotificationBase {
  notificationType: NotificationTypes.TextOnly
  /**
   * Who did send the Notification. This can also be an Object.
   */
  fromName: string
}

/**
 * A system notification.
 * 
 * Similarly to {@link TextNotification}.
 */
export interface SystemNotification extends NotificationBase {
  notificationType: NotificationTypes.System
}

/**
 * A friendship offer.
 */
export interface FriendshipOfferNotification extends NotificationBase {
  notificationType: NotificationTypes.FriendshipOffer
  fromId: string
  fromName: string
  sessionId: string
}

/**
 * Friend online change
 */
export interface FriendOnlineStateChangeNotification extends NotificationBase {
  notificationType: NotificationTypes.FriendOnlineStateChange
  friendId: string
  online: boolean
  text: ''
}

/**
 * A group invitation.
 * 
 * It contains fee, roleId infos.
 * 
 * Answers are send to groupId with and the sessionId set to transactionId.
 */
export interface GroupInvitationNotification extends NotificationBase {
  notificationType: NotificationTypes.GroupInvitation
  /**
   * Id to track the invitation.
   * 
   * This will be the sessionId of the answer.
   */
  transactionId: string
  groupId: string
  roleId: string
  fee: number
  name: string
  useOfflineCap: boolean
}

/**
 * Notification of a group.
 * 
 * This can contain an object.
 */
export interface GroupNoticeNotification extends NotificationBase {
  notificationType: NotificationTypes.GroupNotice
  title: string
  groupId: string
  senderName: string
  senderId: string
  time: number
  item?: {
    name: string
    type: AssetType
    transactionId: string
  }
}

/**
 * Notification to share an URL.
 * 
 * It will display an <a>.
 */
export interface LoadURLNotification extends NotificationBase {
  notificationType: NotificationTypes.LoadURL
  url: URL
  fromId: string
  fromName: string
}

/**
 * Request that a Teleportation lure will be send.
 * 
 * Answer is a {@link NotificationTypes.TeleportLure}.
 */
export interface RequestTeleportLureNotification extends NotificationBase {
  notificationType: NotificationTypes.RequestTeleportLure
  fromId: string
  fromName: string
}

/**
 * In invitation to teleport to ones location.
 */
export interface TeleportLure extends NotificationBase {
  notificationType: NotificationTypes.TeleportLure
  fromId: string
  fromName: string
  lureId: string
  /**
   * Id of the region.
   * 
   * TODO: Change it to a 64bit BigInt.
   */
  regionId: [number, number]
  position: [number, number, number]
  lockAt: [number, number, number]
  maturity: Maturity
  godLike: boolean
}

/**
 * Inventory offer.
 */
export interface InventoryOfferedNotification extends NotificationBase {
  notificationType: NotificationTypes.InventoryOffered
  fromObject: boolean
  fromGroup: boolean
  fromId: string
  fromName: string
  item: {
    objectId: string
    type: AssetType
    transactionId: string
  }
}

/**
 * Dialog of a script.
 * 
 * It can contain multiple buttons.
 * 
 * TODO: implement actions, tests and find out the interface.
 */
export interface ScriptDialogNotification extends NotificationBase {
  notificationType: NotificationTypes.ScriptDialog
}

/**
 * A request for permission. Send if a script wants to control the avatar.
 * 
 * TODO: implement actions, tests and find out the interface.
 */
export interface PermissionsNotification extends NotificationBase {
  notificationType: NotificationTypes.Permissions
}

/**
 * Collection of all Notification interfaces.
 * 
 * It is used in places where every type is possible.
 */
export type Notification = TextNotification |
  SystemNotification |
  FriendshipOfferNotification |
  FriendOnlineStateChangeNotification |
  GroupInvitationNotification |
  GroupNoticeNotification |
  LoadURLNotification |
  RequestTeleportLureNotification |
  TeleportLure |
  InventoryOfferedNotification |
  ScriptDialogNotification |
  PermissionsNotification

export enum NotificationTypes {
  /**
   * This notification only has text and an OK-button.
   */
  TextOnly = 0,
  /**
   * Like {@link NotificationTypes.TextOnly} but from the System (Grid).
   */
  System,
  /**
   * A friend did go online or offline.
   */
  FriendOnlineStateChange,
  /**
   * This notification represents a friendship offer.
   * 
   * It has the avatar name, their message and accept and decline buttons.
   */
  FriendshipOffer,
  /**
   * This notification represents a group incitation.
   * 
   * It has the avatar name, their message, the group name and
   * accept and decline buttons.
   */
  GroupInvitation,
  /**
   * This notification is to all group members.
   * 
   * It can have an inventory item in it.
   */
  GroupNotice,
  /**
   * A goto url notification.
   * 
   * It has the an info text with the avatar name, their message and a link and an OK-Button.
   * 
   * The link is: `<a href="link" target='_blank' rel="noopener noreferrer">`
   */
  LoadURL,
  /**
   * A request that you send a {@link IMDialog.TeleportLureOffered}.
   * 
   * It has the avatar info (+ message) and accept and decline buttons.
   */
  RequestTeleportLure,
  /**
   * A Teleport request. Clicking OK teleports you.
   * 
   * It has the avatar info (+ message), location info and accept and decline buttons.
   */
  TeleportLure,
  /**
   * An inventory item or folder was offered.
   * 
   * This can be from an avatar or an object. It will have accept and decline buttons.
   * 
   * This is a parsed {@link IMDialog.InventoryOffered} or {@link IMDialog.TaskInventoryOffered}.
   * It results into {@link IMDialog.InventoryAccepted}, {@link IMDialog.InventoryDeclined},
   * {@link IMDialog.TaskInventoryAccepted} and {@link IMDialog.TaskInventoryDeclined}.
   */
  InventoryOffered,
  /**
   * A dialog from a script with buttons.
   */
  ScriptDialog,
  /**
   * A permission dialog.
   * 
   * Can a script have permissions over you?
   */
  Permissions,
}
