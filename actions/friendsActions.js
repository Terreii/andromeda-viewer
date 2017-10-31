'use strict'

import { getActiveCircuit } from '../session'
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

export function getAllFriendsDisplayNames () {
  return (dispatch, getState) => {
    const state = getState()

    const names = state.names.get('names')
    const friendsIds = state.friends
      .map(friend => friend.get('id'))
      .push(state.account.get('agentId')) // Add self
      .filter(id => !names.has(id) || !names.get(id).willHaveDisplayName()) // unknown only
      .toArray()

    const fetchUrl = new window.URL(state.names.get('getDisplayNamesURL'))
    friendsIds.forEach(id => fetchUrl.searchParams.append('ids', id))

    dispatch({
      type: 'DisplayNamesStartLoading',
      ids: friendsIds
    })

    fetchLLSD('GET', fetchUrl.href).then(result => {
      dispatch({
        type: 'DisplayNamesLoaded',
        agents: result.agents,
        badIDs: result['bad_ids'],
        badNames: result['bad_usernames']
      })
    })
  }
}
