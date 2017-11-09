import { getActiveCircuit, getAgentId, getSessionId } from '../session'
import { fetchLLSD } from './llsd'

let UUIDNameIds = []
let didRequestIds = {} // Stores the time of the last request for a ID
function sendUUIDNameRequest () {
  if (UUIDNameIds.length === 0) {
    return
  }
  getActiveCircuit().send('UUIDNameRequest', {
    UUIDNameBlock: UUIDNameIds.map((id) => {
      didRequestIds[id] = Date.now()
      return {
        ID: id
      }
    })
  })
  UUIDNameIds = []
}

export function getName (id) {
  const timeLimit = Date.now() - 4000
  // If the id is not already in the next request
  // and wasn't requested in the last 4 seconds
  const wasRequested = UUIDNameIds.every(idInRequest => id !== idInRequest) &&
    (didRequestIds[id] == null || didRequestIds[id] < timeLimit)
  if (UUIDNameIds.length === 0 || wasRequested) {
    UUIDNameIds.push(id)
  }
  setTimeout(sendUUIDNameRequest, 1000)
}

function loadDisplayNames (idsArray) {
  const ids = idsArray.map(id => id.toString())
  return (dispatch, getState) => {
    if (ids.length === 0) return

    const fetchUrlString = getState().names.get('getDisplayNamesURL')
    if (fetchUrlString == null) return // Not jet loaded
    const fetchUrl = new window.URL(fetchUrlString)
    ids.forEach(id => fetchUrl.searchParams.append('ids', id))

    dispatch({
      type: 'DisplayNamesStartLoading',
      ids
    })

    fetchLLSD('GET', fetchUrl.href).then(result => {
      const badIDs = result['bad_ids'] || []
      badIDs.forEach(id => getName(id.toString())) // Try again

      dispatch({
        type: 'DisplayNamesLoaded',
        agents: result.agents,
        badIDs,
        badNames: result['bad_usernames'] || []
      })
    })
  }
}

export function getDisplayName (id) {
  return (dispatch, getState) => {
    const state = getState()

    const names = state.names.get('names')
    const idString = id.toString()
    if (names.has(idString) && names.get(idString).willHaveDisplayName()) return

    const toLoad = names.filter(name => !name.willHaveDisplayName()).keySeq().toArray()
    if (toLoad.length > 0) {
      dispatch(loadDisplayNames(toLoad))
    }
  }
}

export function getAllFriendsDisplayNames () {
  return (dispatch, getState) => {
    const state = getState()

    const names = state.names.get('names')
    const friendsIds = state.friends
      .map(friend => friend.get('id'))
      .push(state.account.get('agentId')) // Add self
      .filter(id => !names.has(id) || !names.get(id).willHaveDisplayName()) // unknown only
      .toArray()

    dispatch(loadDisplayNames(friendsIds))
  }
}

// Server answers with a ChangeUserRights Packet
export function updateRights (friendUUID, changedRights) {
  const id = friendUUID.toString()
  return (dispatch, getState) => {
    // Get friend
    const friend = getState().friends.find(friend => friend.get('id') === id)
    if (friend == null) return

    const getRight = name => changedRights[name] == null
      ? friend.getIn(['rightsGiven', name])
      : changedRights[name]

    // Get and combine rights
    const canSeeOnline = getRight('canSeeOnline')
    const canSeeOnMap = getRight('canSeeOnMap')
    const canModifyObjects = getRight('canModifyObjects')

    const rightsInt = (canSeeOnline << 0) | (canSeeOnMap << 1) | (canModifyObjects << 2)

    getActiveCircuit().send('GrantUserRights', {
      AgentData: [
        {
          AgentID: getAgentId(),
          SessionID: getSessionId()
        }
      ],
      Rights: [
        {
          AgentRelated: id,
          RelatedRights: rightsInt
        }
      ]
    })
  }
}
