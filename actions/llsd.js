import LLSD from '../llsd'

function parseLLSD (response) {
  const result = response.text()
    .then(body => LLSD.parse(response.headers.get('content-type'), body))
  return result
}

export function fetchLLSD (url, data) {
  const headers = new window.Headers()
  headers.append('content-type', 'text/plain')
  headers.append('x-andromeda-fetch-url', url)
  headers.append('x-andromeda-fetch-method', 'POST')
  headers.append('x-andromeda-fetch-type', LLSD.MIMETYPE_XML)
  const result = window.fetch('/hoodie/andromeda-viewer/proxy', {
    method: 'POST',
    headers,
    body: `<?xml version="1.0" encoding="UTF-8"?>\n${LLSD.formatXML(data)}\n`
  })
    .then(response => parseLLSD(response))
  return result
}

export function fetchSeedCapabilities (url) {
  return dispatch => {
    fetchLLSD(url, [
      'GetDisplayNames'
    ])
      .then(capabilities => {
        dispatch({
          type: 'SeedCapabilitiesLoaded',
          capabilities
        })
      })
      .catch(error => console.error(error))
  }
}
