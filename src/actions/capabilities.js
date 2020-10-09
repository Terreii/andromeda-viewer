import { Binary, URI, UUID } from '../llsd'
import caps from './capabilities.json'

import { selectEventQueueGetUrl } from '../bundles/region'
import { selectAvatarIdentifier } from '../bundles/session'

export function fetchSeedCapabilities (url) {
  return async (dispatch, getState, { fetchLLSD }) => {
    try {
      const response = await fetchLLSD(url, {
        method: 'POST',
        body: caps
      })
      if (response.ok) {
        const capabilities = await response.llsd()
        dispatch({
          type: 'SeedCapabilitiesLoaded',
          capabilities
        })
        dispatch(activateEventQueue())
      }
    } catch (error) {
      console.error(error)
    }
  }
}

// http://wiki.secondlife.com/wiki/EventQueueGet
async function * eventQueueGet (getState, fetchLLSD) {
  const url = selectEventQueueGetUrl(getState())
  const avatarIdentifier = selectAvatarIdentifier(getState())
  let ack = 0

  do {
    let response
    try {
      response = await fetchLLSD(url, {
        method: 'POST',
        body: {
          done: false,
          ack
        }
      })
    } catch (err) {
      // network error?
      console.error(err)
      continue
    }

    if (response.ok) {
      const body = await response.llsd()
      ack = body.id
      for (const event of body.events) {
        if (selectAvatarIdentifier(getState()) === avatarIdentifier) {
          yield event
        } else {
          return
        }
      }
    } else if (response.status === 404) { // Session did end
      return []
    } else if (response.status === 502 || response.status === 499) {
      // Request did Timeout. This is not an error! This is expected.
      // The EventQueue server is a proxy. If the server behind the proxy times out, than the
      // EventQueue server interprets this as a generic error and returns a 502.
      // 499 is from the dev-server.
      continue
    } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
      // Some error did happen!
      console.error(
        new Error(`${response.status} - ${response.statusText}\n\n${await response.text()}`)
      )
      return
    } else {
      await new Promise(resolve => { setTimeout(resolve, 200) })
      continue
    }
  } while (selectAvatarIdentifier(getState()) === avatarIdentifier)
}

function activateEventQueue () {
  return async (dispatch, getState, { fetchLLSD }) => {
    for await (const event of eventQueueGet(getState, fetchLLSD)) {
      try {
        toJSON(event.body)
        dispatch({
          type: 'eventQueue/' + event.message,
          payload: event.body,
          meta: {
            message: event.message
          }
        })
      } catch (err) {
        console.error(err)
      }
    }
  }
}

/**
 * This function checks all values of LLSD data for non JSON data modifies them.
 * @param {object|object[]} object A LLSD Object or Array.
 */
export function toJSON (object) {
  if (object == null) return null

  for (const [key, value] of Object.entries(object)) {
    if (value instanceof Date) {
      object[key] = value.getTime()
    } else if (value instanceof Binary) {
      object[key] = value.toArray()
    } else if (value instanceof URI || value instanceof UUID) {
      object[key] = value.toString()
    } else if (typeof object === 'object') { // Objects and Arrays
      toJSON(value)
    }
  }
}
