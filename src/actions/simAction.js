import {createNewIMChat} from './chatMessageActions'
import {
  getValueOf,
  getStringValueOf,
  mapBlockOf
} from '../network/msgGetters'

function parseChatFromSimulator (msg) {
  const chatMsg = {
    fromName: getStringValueOf(msg, 'ChatData', 'FromName'),
    sourceID: getValueOf(msg, 'ChatData', 'SourceID'),
    ownerID: getValueOf(msg, 'ChatData', 'OwnerID'),
    sourceType: getValueOf(msg, 'ChatData', 'SourceType'),
    chatType: getValueOf(msg, 'ChatData', 'ChatType'),
    audible: getValueOf(msg, 'ChatData', 'Audible'),
    position: getValueOf(msg, 'ChatData', 'Position'),
    message: getStringValueOf(msg, 'ChatData', 'Message'),
    time: Date.now()
  }
  return chatMsg
}

function parseIM (message) {
  const toAgentID = getValueOf(message, 'MessageBlock', 'ToAgentID')
  const fromId = getValueOf(message, 'AgentData', 'AgentID')
  const time = getValueOf(message, 'MessageBlock', 'Timestamp')

  const IMmsg = {
    sessionID: getValueOf(message, 'AgentData', 'SessionID'),
    fromId,
    fromGroup: getValueOf(message, 'MessageBlock', 'FromGroup'),
    toAgentID,
    parentEstateID: getValueOf(message, 'MessageBlock', 'ParentEstateID'),
    regionID: getValueOf(message, 'MessageBlock', 'RegionID'),
    position: getValueOf(message, 'MessageBlock', 'Position'),
    offline: getValueOf(message, 'MessageBlock', 'Offline'),
    dialog: getValueOf(message, 'MessageBlock', 'Dialog'),
    id: getValueOf(message, 'MessageBlock', 'ID'),
    fromAgentName: getStringValueOf(message, 'MessageBlock', 'FromAgentName'),
    message: getStringValueOf(message, 'MessageBlock', 'Message'),
    binaryBucket: getValueOf(message, 'MessageBlock', 'BinaryBucket'),
    time: time !== 0 ? time : Date.now()
  }

  // If it is a group chat, toAgentID is the Group-UUID.
  IMmsg.chatUUID = IMmsg.fromGroup ? IMmsg.toAgentID : IMmsg.id
  return IMmsg
}

function parseUserRights (message, getState) {
  const rights = mapBlockOf(message, 'Rights', getValue => {
    return {
      agentId: getValue('AgentRelated'),
      rights: getValue('RelatedRights')
    }
  })
  return {
    type: 'ChangeUserRights',
    ownId: getState().account.get('agentId'),
    fromId: getValueOf(message, 'AgentData', 'AgentID'),
    userRights: rights
  }
}

// Gets all messages from the SIM and filters them, and if needed: calls their own actions.
function simActionFilter (msg) {
  const name = msg.name

  switch (name) {
    case 'ChatFromSimulator':
      const parsed = parseChatFromSimulator(msg)
      return dispatchSIMAction(name, parsed, 'localchat/' + new Date(parsed.time).toJSON())

    case 'ImprovedInstantMessage':
      const parsedMsg = parseIM(msg)
        // Start a new IMChat.
      return dispatch => {
        dispatch(createNewIMChat(
          parsedMsg.dialog, parsedMsg.chatUUID, parsedMsg.fromId, parsedMsg.fromAgentName
        ))
        const id = `imChats/${parsedMsg.chatUUID}/${new Date(parsedMsg.time).toJSON()}`
        dispatch(dispatchSIMAction(name, parsedMsg, id))
      }

    case 'ChangeUserRights':
      return (dispatch, getState) => {
        dispatch(parseUserRights(msg, getState))
      }

    case 'RegionHandshake':
      return sendRegionHandshakeReply(msg)

    // For all messages that will and can be directly dispatched
    case 'AgentMovementComplete':
    case 'RegionInfo':
    case 'UUIDNameReply':
      return msg

    default:
      break
  }
}

// Dispatches all parsed messages.
// If they have an ID, they will be saved and synced under the avatar name.
function dispatchSIMAction (name, msg, id) {
  return (dispatch, getState, {hoodie}) => {
    const activeState = getState()
    if (typeof id === 'string' && activeState.account.getIn(['viewerAccount', 'loggedIn'])) {
      // Save messages. They will also be synced!
      const avatarIdentifier = activeState.account.get('avatarIdentifier')
      msg._id = avatarIdentifier + '/' + id
      hoodie.store.add(msg).then(doc => {
        dispatch({
          type: name,
          msg: doc
        })
      })
    } else {
      // This is the path for every message, that will not be synced and saved.
      dispatch({
        type: name,
        msg
      })
    }
  }
}

function sendRegionHandshakeReply (RegionHandshake) {
  return (dispatch, getState, {circuit}) => {
    const regionID = getValueOf(RegionHandshake, 'RegionInfo2', 'RegionID')
    const flags = getValueOf(RegionHandshake, 'RegionInfo', 'RegionFlags')

    const session = getState().session

    circuit.send('RegionHandshakeReply', {
      AgentData: [
        {
          AgentID: session.get('agentId'),
          SessionID: session.get('sessionId')
        }
      ],
      RegionInfo: [
        {
          Flags: flags
        }
      ]
    }, true)

    dispatch({
      type: 'RegionHandshake',
      regionID,
      flags
    })
  }
}

export default function createCallback (dispatch) {
  return msg => {
    const action = simActionFilter(msg)
    if (action != null) { // If the packet is parsed, an action will be dispatched.
      dispatch(action)
    }
  }
}
