import { createNewIMChat } from './chatMessageActions'

function parseChatFromSimulator (msg) {
  const chatMsg = {
    fromName: msg.getStringValue('ChatData', 'FromName'),
    sourceID: msg.getValue('ChatData', 'SourceID'),
    ownerID: msg.getValue('ChatData', 'OwnerID'),
    sourceType: msg.getValue('ChatData', 'SourceType'),
    chatType: msg.getValue('ChatData', 'ChatType'),
    audible: msg.getValue('ChatData', 'Audible'),
    position: msg.getValue('ChatData', 'Position'),
    message: msg.getStringValue('ChatData', 'Message'),
    time: Date.now()
  }
  return chatMsg
}

function parseIM (message) {
  const toAgentID = message.getValue('MessageBlock', 'ToAgentID')
  const fromId = message.getValue('AgentData', 'AgentID')
  const time = message.getValue('MessageBlock', 'Timestamp')

  const IMmsg = {
    sessionID: message.getValue('AgentData', 'SessionID'),
    fromId,
    fromGroup: message.getValue('MessageBlock', 'FromGroup'),
    toAgentID,
    parentEstateID: message.getValue('MessageBlock', 'ParentEstateID'),
    regionID: message.getValue('MessageBlock', 'RegionID'),
    position: message.getValue('MessageBlock', 'Position'),
    offline: message.getValue('MessageBlock', 'Offline'),
    dialog: message.getValue('MessageBlock', 'Dialog'),
    id: message.getValue('MessageBlock', 'ID'),
    fromAgentName: message.getStringValue('MessageBlock', 'FromAgentName'),
    message: message.getStringValue('MessageBlock', 'Message'),
    binaryBucket: message.getValue('MessageBlock', 'BinaryBucket'),
    time: time !== 0 ? time : Date.now()
  }

  // If it is a group chat, toAgentID is the Group-UUID.
  IMmsg.chatUUID = IMmsg.fromGroup ? IMmsg.toAgentID : IMmsg.id
  return IMmsg
}

function parseUUIDNameReply (message) {
  return message.mapBlock('UUIDNameBlock', getValue => {
    return {
      firstName: getValue('FirstName', true),
      lastName: getValue('LastName', true),
      id: getValue('ID')
    }
  })
}

function parseUserRights (message, getState) {
  const rights = message.mapBlock('Rights', getValue => {
    return {
      agentId: getValue('AgentRelated'),
      rights: getValue('RelatedRights')
    }
  })
  return {
    ownId: getState().account.get('agentId'),
    fromId: message.getValue('AgentData', 'AgentID'),
    userRights: rights
  }
}

function parseRegionInfo (message) {
  return {
    regionInfo: message.getValues('RegionInfo', 0, []),
    regionInfo2: message.getValues('RegionInfo2', 0, [])
  }
}

// Gets all messages from the SIM and filters them for the UI
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

    case 'UUIDNameReply':
      return dispatchSIMAction(name, parseUUIDNameReply(msg))

    case 'ChangeUserRights':
      return (dispatch, getState) => {
        dispatch(dispatchSIMAction(name, parseUserRights(msg, getState)))
      }

    case 'AgentMovementComplete':
      return dispatchSIMAction(name, {
        position: msg.getValue('Data', 'Position'),
        lookAt: msg.getValue('Data', 'LookAt')
      })

    case 'RegionInfo':
      return dispatchSIMAction(name, parseRegionInfo(msg))

    case 'RegionHandshake':
      return sendRegionHandshakeReply(msg)

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
    const regionID = RegionHandshake.getValue('RegionInfo2', 'RegionID')
    const flags = RegionHandshake.getValue('RegionInfo', 'RegionFlags')

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
    })

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
