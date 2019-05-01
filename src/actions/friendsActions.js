import { fetchLLSD } from './llsd'

import { getAgentId, getSessionId } from '../selectors/session'
import { getFriends, getFriendById } from '../selectors/people'
import { getNames, getDisplayNamesURL } from '../selectors/names'

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

    const fetchUrlString = getDisplayNamesURL(getState())
    if (fetchUrlString == null) return // Not jet loaded

    const fetchUrl = new window.URL(fetchUrlString)
    ids.forEach(id => fetchUrl.searchParams.append('ids', id))

    dispatch({
      type: 'DisplayNamesStartLoading',
      ids
    })

    fetchLLSD('GET', fetchUrl.href).then(result => {
      const badIDs = result['bad_ids'] || []
      dispatch(sendUUIDNameRequest(badIDs)) // Try again

      dispatch({
        type: 'DisplayNamesLoaded',
        agents: result.agents,
        badIDs,
        badNames: result['bad_usernames'] || []
      })
    })
  }
}

export function getDisplayName () {
  return (dispatch, getState) => {
    const names = getNames(getState())

    const toLoad = names.filter(name => !name.willHaveDisplayName()).keySeq().toArray()
    if (toLoad.length > 0) {
      dispatch(loadDisplayNames(toLoad))
    }
  }
}

export function getAllFriendsDisplayNames () {
  return (dispatch, getState) => {
    const state = getState()

    const names = getNames(state)
    const friendsIds = getFriends(state)
      .map(friend => friend.get('id'))
      .push(getAgentId(state)) // Add self
      .filter(id => !names.has(id) || !names.get(id).willHaveDisplayName()) // unknown only
      .toArray()

    dispatch(loadDisplayNames(friendsIds))
  }
}

// Server answers with a ChangeUserRights Packet
export function updateRights (friendUUID, changedRights) {
  const id = friendUUID.toString()
  return (dispatch, getState, { circuit }) => {
    const state = getState()

    // Get friend
    const friend = getFriendById(state, id)
    if (friend == null) return

    const getRight = name => changedRights[name] == null
      ? friend.getIn(['rightsGiven', name])
      : changedRights[name]

    // Get and combine rights
    const canSeeOnline = getRight('canSeeOnline')
    const canSeeOnMap = getRight('canSeeOnMap')
    const canModifyObjects = getRight('canModifyObjects')

    const rightsInt = (canSeeOnline << 0) | (canSeeOnMap << 1) | (canModifyObjects << 2)

    circuit.send('GrantUserRights', {
      AgentData: [
        {
          AgentID: getAgentId(state),
          SessionID: getSessionId(state)
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
          AgentID: getAgentId(state),
          SessionID: getSessionId(state)
        }
      ],
      TransactionBlock: [
        { TransactionID: sessionId }
      ],
      FolderData: [
        // TODO add folderId { FolderID: '' }
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
          AgentID: getAgentId(state),
          SessionID: getSessionId(state)
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
