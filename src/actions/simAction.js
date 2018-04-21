import {createNewIMChat, parseChatFromSimulator, parseIM} from './chatMessageActions'
import {getValueOf, mapBlockOf} from '../network/msgGetters'

function parseUserRights (message) {
  return (dispatch, getState) => {
    const rights = mapBlockOf(message, 'Rights', getValue => {
      return {
        agentId: getValue('AgentRelated'),
        rights: getValue('RelatedRights')
      }
    })
    dispatch({
      type: 'ChangeUserRights',
      ownId: getState().account.get('agentId'),
      fromId: getValueOf(message, 'AgentData', 'AgentID'),
      userRights: rights
    })
  }
}

// Gets all messages from the SIM and filters them, and if needed: calls their own actions.
function simActionFilter (msg) {
  const name = msg.name

  switch (name) {
    case 'ChatFromSimulator':
      const parsed = parseChatFromSimulator(msg)
      return dispatchChatAction(name, parsed, 'localchat/' + new Date(parsed.time).toJSON())

    case 'ImprovedInstantMessage':
      const parsedMsg = parseIM(msg)
        // Start a new IMChat.
      return dispatch => {
        dispatch(createNewIMChat(
          parsedMsg.dialog, parsedMsg.chatUUID, parsedMsg.fromId, parsedMsg.fromAgentName
        ))
        const id = `imChats/${parsedMsg.chatUUID}/${new Date(parsedMsg.time).toJSON()}`
        dispatch(dispatchChatAction(name, parsedMsg, id))
      }

    case 'ChangeUserRights':
      return parseUserRights(msg)

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

// Dispatches chat (and IM) messages.
// They will be saved and synced under the avatar name.
function dispatchChatAction (name, msg, id) {
  return async (dispatch, getState, {hoodie}) => {
    if (typeof id !== 'string') return

    const activeState = getState()
    if (
      activeState.account.getIn(['viewerAccount', 'loggedIn']) && activeState.account.get('sync')
    ) {
      // Save messages. They will also be synced!
      msg._id = activeState.account.get('avatarIdentifier') + '/' + id

      const doc = await hoodie.store.add(msg)
      dispatch({
        type: name,
        msg: doc
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
