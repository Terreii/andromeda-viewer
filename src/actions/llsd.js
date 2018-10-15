import LLSD from '../llsd'

async function parseLLSD (response) {
  const body = await response.text()
  return LLSD.parse(response.headers.get('content-type'), body)
}

export async function fetchLLSD (method, url, data = null, mimeType = LLSD.MIMETYPE_XML) {
  const headers = new window.Headers()
  headers.append('content-type', 'text/plain')
  headers.append('x-andromeda-fetch-url', url)
  headers.append('x-andromeda-fetch-method', method)
  headers.append('x-andromeda-fetch-type', mimeType)

  const body = data == null ? undefined : LLSD.format(mimeType, data)

  const response = await window.fetch('/hoodie/andromeda-viewer/proxy', {
    method: 'POST',
    headers,
    body
  })

  switch (response.headers.get('content-type')) {
    case 'application/llsd+binary':
    case 'application/llsd+json':
    case 'application/llsd+xml':
      return parseLLSD(response)

    default:
      throw new Error(await response.text())
  }
}

export function fetchSeedCapabilities (url) {
  return dispatch => {
    const finished = fetchLLSD('POST', url, [
      'EventQueueGet',
      'GetDisplayNames'
    ])
      .then(capabilities => {
        dispatch({
          type: 'SeedCapabilitiesLoaded',
          capabilities
        })
        dispatch(activateEventQueue())
      })
      .catch(error => console.error(error))
    return finished
  }
}

async function * eventQueueGet (getState, ack) {
  const url = getState().session.get('eventQueueGetUrl')

  while (getState().session.get('loggedIn')) {
    const data = {
      done: false,
      ack: ack.last
    }

    try {
      yield fetchLLSD('POST', url, data)
    } catch (err) {
      console.error(err)
    }
  }

  fetchLLSD('POST', url, { done: true, ack: ack.last })
}

function activateEventQueue () {
  const ack = { last: 0 }

  return async (dispatch, getState) => {
    for await (const eventQueue of eventQueueGet(getState, ack)) {
      ack.last = eventQueue.id

      for (const event of eventQueue.events) {
        try {
          dispatch({
            type: 'EVENT_QUEUE_' + event.message,
            message: event.message,
            body: event.body
          })
        } catch (err) {
          console.error(err)
        }
      }
    }
  }
}
