import { fetchLLSD } from './llsd'

import { selectFriends, selectFriendById } from '../bundles/friends'
import { selectFolderForAssetType } from '../bundles/inventory'
import {
  displayNamesStartLoading,
  displayNamesLoaded,
  selectNames,
  selectDisplayNamesURL,
  selectOwnAvatarName,
  selectAvatarNameById
} from '../bundles/names'
import { selectAgentId, selectSessionId } from '../bundles/session'

import { IMDialog } from '../types/chat'
import { AssetType } from '../types/inventory'
import { TeleportFlags } from '../types/people'
import { getValueOf } from '../network/msgGetters'
import { receive as notificationActionCreator } from '../bundles/notifications'
import {NotificationTypes} from '../types/chat'
function sendUUIDNameRequest (ids) {
  return (dispatch, getState, { circuit }) => {
    if (ids.length === 0) return

    circuit.send('UUIDNameRequest', {
      UUIDNameBlock: ids.map(id => {
        return {
          ID: id.toString()
        }
      })
    }, true)
  }
}

function loadDisplayNames (idsArray) {
  const ids = idsArray.map(id => id.toString())
  return (dispatch, getState) => {
    if (ids.length === 0) return

    const fetchUrlString = selectDisplayNamesURL(getState())
    if (fetchUrlString.length === 0) return // Not jet loaded

    const fetchUrl = new window.URL(fetchUrlString)
    ids.forEach(id => fetchUrl.searchParams.append('ids', id))

    dispatch(displayNamesStartLoading(ids))

    fetchLLSD('GET', fetchUrl.href).then(result => {
      const badIDs = result['bad_ids'] || []
      dispatch(sendUUIDNameRequest(badIDs)) // Try again

      result.agents.forEach(agent => {
        agent.display_name_next_update = agent.display_name_next_update.getTime()
        agent.id = agent.id.toString()
      })

      dispatch(displayNamesLoaded(result.agents, badIDs, result['bad_usernames'] || []))
    })
  }
}

export function FriendOnline(msg) {
  return (dispatch, getState) => {
    let state = getState()
    const fromAgentId = getValueOf(msg, 'AgentBlock', 'AgentID')
    let name = selectAvatarNameById(state,fromAgentId)
    if (name === undefined) {
      dispatch(displayNamesStartLoading([fromAgentId]))
      state = getState()
      name = selectAvatarNameById(state,fromAgentId)
      if(name === undefined) {
        name = fromAgentId
      }
    } else {
      name = "("+name.getFullName()+") " + name.getDisplayName()
    }
    dispatch(handleSystemNotification(name+" is online"))
  }
}
function handleSystemNotification (msg) {
  return notificationActionCreator({
    notificationType: NotificationTypes.System,
    text: msg
  })
}

export function FriendOffline(msg) {
  return (dispatch, getState) => {
    let state = getState()
    const fromAgentId = getValueOf(msg, 'AgentBlock', 'AgentID')
    let name = selectAvatarNameById(state,fromAgentId)
    if (name === undefined) {
      dispatch(displayNamesStartLoading([fromAgentId]))
      state = getState()
      name = selectAvatarNameById(state,fromAgentId)
      if(name === undefined) {
        name = fromAgentId
      }
    } else {
      name = "("+name.getFullName()+") " + name.getDisplayName()
    }

      dispatch(handleSystemNotification(name+" is offline"))
  }
}
export function getDisplayName () {
  return (dispatch, getState) => {
    const names = selectNames(getState())

    const toLoad = Object.keys(names).filter(id => !names[id].willHaveDisplayName())

    if (toLoad.length > 0) {
      dispatch(loadDisplayNames(toLoad))
    }
  }
}

export function getAllFriendsDisplayNames () {
  return (dispatch, getState) => {
    const state = getState()

    const names = selectNames(state)
    const friendsIds = selectFriends(state)
      .map(friend => friend.id)
      .concat([selectAgentId(state)]) // Add self
      .filter(id => !(id in names) || !names[id].willHaveDisplayName()) // unknown only

    dispatch(loadDisplayNames(friendsIds))
  }
}

// Server answers with a ChangeUserRights Packet
export function updateRights (friendUUID, changedRights) {
  const id = friendUUID.toString()
  return (dispatch, getState, { circuit }) => {
    const state = getState()

    // Get friend
    const friend = selectFriendById(state, id)
    if (friend == null) return

    const getRight = name => changedRights[name] == null
      ? friend.rightsGiven[name]
      : changedRights[name]

    // Get and combine rights
    const canSeeOnline = getRight('canSeeOnline')
    const canSeeOnMap = getRight('canSeeOnMap')
    const canModifyObjects = getRight('canModifyObjects')

    const rightsInt = (canSeeOnline << 0) | (canSeeOnMap << 1) | (canModifyObjects << 2)

    circuit.send('GrantUserRights', {
      AgentData: [
        {
          AgentID: selectAgentId(state),
          SessionID: selectSessionId(state)
        }
      ],
      Rights: [
        {
          AgentRelated: id,
          RelatedRights: rightsInt
        }
      ]
    }, true)
  }
}

export function acceptFriendshipOffer (agentId, sessionId) {
  return (dispatch, getState, { circuit }) => {
    const state = getState()

    circuit.send('AcceptFriendship', {
      AgentData: [
        {
          AgentID: selectAgentId(state),
          SessionID: selectSessionId(state)
        }
      ],
      TransactionBlock: [
        { TransactionID: sessionId }
      ],
      FolderData: [
        {
          FolderID: selectFolderForAssetType(state, AssetType.CallingCard).folderId
        }
      ]
    }, true)

    dispatch({
      type: 'FRIENDSHIP_ACCEPTED',
      agentId
    })
  }
}

export function declineFriendshipOffer (agentId, sessionId) {
  return (dispatch, getState, { circuit }) => {
    const state = getState()

    circuit.send('DeclineFriendship', {
      AgentData: [
        {
          AgentID: selectAgentId(state),
          SessionID: selectSessionId(state)
        }
      ],
      TransactionBlock: [
        { TransactionID: sessionId }
      ]
    }, true)

    dispatch({
      type: 'FRIENDSHIP_DECLINED',
      agentId
    })
  }
}

/**
 * Send a Teleport offer to an avatar.
 * @param {string} target UUID of the avatar that the offer should be send to.
 * @param {string?} message Optional message to be displayed.
 */
export function offerTeleportLure (target, message = null) {
  return (dispatch, getState, { circuit }) => {
    const activeState = getState()

    const text = message || 'Join me'

    circuit.send('StartLure', {
      AgentData: [
        {
          AgentID: selectAgentId(activeState),
          SessionID: selectSessionId(activeState)
        }
      ],
      Info: [
        {
          LureType: 0,
          Message: text
        }
      ],
      TargetData: [
        {
          TargetID: target
        }
      ]
    }, true)
  }
}

export function acceptTeleportLure (targetId, lureId) {
  return (dispatch, getState, { circuit }) => {
    const activeState = getState()

    circuit.send('TeleportLureRequest', {
      Info: [
        {
          AgentID: selectAgentId(activeState),
          SessionID: selectSessionId(activeState),
          LureID: lureId,
          TeleportFlags: TeleportFlags.viaLure
        }
      ]
    }, true)
  }
}

export function declineTeleportLure (targetId, lureId) {
  return (dispatch, getState, { circuit }) => {
    const activeState = getState()

    circuit.send('ImprovedInstantMessage', {
      AgentData: [
        {
          AgentID: selectAgentId(activeState),
          SessionID: selectSessionId(activeState)
        }
      ],
      MessageBlock: [
        {
          FromAgentName: selectOwnAvatarName(activeState).getFullName(),
          ToAgentID: targetId,
          ID: lureId,
          Dialog: IMDialog.DenyTeleport
        }
      ]
    }, true)
  }
}
