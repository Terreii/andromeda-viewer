import { receiveChatFromSimulator, receiveIM } from './chatMessageActions'
import { getValueOf } from '../network/msgGetters'

import { changeRights } from '../bundles/friends'
import { selectAgentId, selectSessionId } from '../bundles/session'
import { FriendOnline, FriendOffline } from './friendsActions'

// Gets all messages from the SIM and filters them, and if needed: calls their own actions.
function simActionFilter (msg) {
  switch (msg.name) {
    case 'ChatFromSimulator':
      return receiveChatFromSimulator(msg)

    case 'ImprovedInstantMessage':
      return receiveIM(msg)

    case 'ChangeUserRights':
      return parseUserRights(msg)

    case 'RegionHandshake':
      return sendRegionHandshakeReply(msg)
    case 'OnlineNotification':
      return FriendOnline(msg)
    case 'OfflineNotification':
      return FriendOffline(msg)
    // For all messages that will and can be directly dispatched
    case 'AgentMovementComplete':
    case 'AvatarPropertiesReply':
    case 'AvatarInterestsReply':
    case 'AvatarGroupsReply':
    case 'RegionInfo':
    case 'UUIDNameReply':
      return msg

    default:
      if (process.env.NODE_ENV !== 'production' && window.debugDispatchAllMsg) {
        return msg
      }
      break
  }
}

// A global variable for development.
// Set it in development to true to dispatch all network messages.
if (process.env.NODE_ENV !== 'production') {
  window.debugDispatchAllMsg = window.debugDispatchAllMsg || false
}

function parseUserRights (message) {
  return (dispatch, getState) => {
    dispatch(changeRights(message, selectAgentId(getState())))
  }
}

function sendRegionHandshakeReply (RegionHandshake) {
  return (dispatch, getState, { circuit }) => {
    const regionID = getValueOf(RegionHandshake, 'RegionInfo2', 'RegionID')
    const flags = getValueOf(RegionHandshake, 'RegionInfo', 'RegionFlags')

    const state = getState()

    circuit.send('RegionHandshakeReply', {
      AgentData: [
        {
          AgentID: selectAgentId(state),
          SessionID: selectSessionId(state)
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
