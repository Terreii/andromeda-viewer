import LLSD from '../llsd'

function parseLLSD (response) {
  const result = response.text()
    .then(body => LLSD.parse(response.headers.get('content-type'), body))
  return result
}

export function fetchLLSD (method, url, data = null, mimeType = LLSD.MIMETYPE_XML) {
  const headers = new window.Headers()
  headers.append('content-type', 'text/plain')
  headers.append('x-andromeda-fetch-url', url)
  headers.append('x-andromeda-fetch-method', method)
  headers.append('x-andromeda-fetch-type', mimeType)

  const body = data == null ? undefined : LLSD.format(mimeType, data)

  const result = window.fetch('/hoodie/andromeda-viewer/proxy', {
    method: 'POST',
    headers,
    body
  })
    .then(response => parseLLSD(response))
  return result
}

export function fetchSeedCapabilities (url) {
  return dispatch => {
    const finished = fetchLLSD('POST', url, [
      'GetDisplayNames'
    ])
      .then(capabilities => {
        dispatch({
          type: 'SeedCapabilitiesLoaded',
          capabilities
        })
      })
      .catch(error => console.error(error))
    return finished
  }
}
