import LLSD from '../llsd'

const mimeTypes = [LLSD.MIMETYPE_XML, LLSD.MIMETYPE_JSON, LLSD.MIMETYPE_BINARY]

/**
 * Fetch a resource over the proxy.
 * @param {function} getState Get the current state.
 * @param {string}   resource URL of the resource or a Request.
 * @param {object}   [init]   Optional options object
 */
export function proxyFetch (getState, resource, init = {}) {
  if (resource instanceof window.Request) {
    throw new TypeError('Using "Request" is not yet supported!')
  } else {
    if (init.headers == null) {
      init.headers = {}
    }

    // add the session id header for the proxy.
    // To authenticate the current active grid session.
    const sessionId = getState().session.andromedaSessionId
    if (init.headers instanceof window.Headers) {
      init.headers.set('x-andromeda-session-id', sessionId)
    } else {
      init.headers['x-andromeda-session-id'] = getState().session.andromedaSessionId
    }

    const aURL = new URL(resource, window.location.href)
    // transform url to the proxy url
    const protocol = aURL.protocol.replace(/:$/, '')
    const requestURL = new URL(
      `/api/proxy/${protocol}/${aURL.host}${aURL.pathname}`,
      window.location.href
    )
    requestURL.search = aURL.search

    resource = requestURL.href
  }

  return window.fetch(resource, init)
}

/**
 * Fetch api for LLSD.
 * The API is the save as Fetch
 * https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch
 * @param {function} getState Get the current state.
 * @param {string}   resource URL of the resource to fetch.
 * @param {object}   init     Init config for fetch.
 */
export async function fetchLLSD (getState, resource, init = {}) {
  if (resource instanceof window.Request) {
    throw new TypeError('Using "Request" is not yet supported!')
  }

  if (init.headers == null) {
    init.headers = {}
  }

  // get the content-type to check if it has already a LLSD type.
  let contentType = init.headers instanceof window.Headers
    ? (init.headers.get('Content-Type') || init.headers.get('content-type'))
    : (init.headers['Content-Type'] || init.headers['content-type'])

  if (init.body != null && !mimeTypes.includes(contentType)) {
    // If not: add the default XML type.
    contentType = LLSD.MIMETYPE_XML

    if (init.headers instanceof window.Headers) {
      init.headers.set('content-type', LLSD.MIMETYPE_XML)
    } else {
      init.headers['content-type'] = LLSD.MIMETYPE_XML
    }
  }

  if (init.body != null && typeof init.body !== 'string') {
    init.body = LLSD.format(contentType, init.body)
  }

  // Do the fetch
  const response = await proxyFetch(getState, resource, init)

  // add a LLSD parsing method that work similar to response.json()
  response.llsd = async () => {
    const body = await response.text()

    const responseContentType = response.headers.get('content-type')
    const parsed = LLSD.parse(responseContentType, body)
    return parsed
  }

  return response
}
