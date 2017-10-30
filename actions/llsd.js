import LLSD from '../llsd'

function parseLLSD (response) {
  const result = response.text()
    .then(body => LLSD.parse(response.headers.get('content-type'), body))
  return result
}

export function fetchLLSD (url, data) {
  const headers = new window.Headers()
  headers.append('Content-Type', LLSD.MIMETYPE_JSON)
  headers.append('X-Fetch-Url', url)
  const result = window.fetch('/hoodie/andromeda-viewer/proxy', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      method: 'POST',
      type: LLSD.MIMETYPE_XML,
      body: `<?xml version="1.0" encoding="UTF-8"?>\n${LLSD.formatXML(data)}\n`
    })
  })
    .then(response => parseLLSD(response))
  return result
}

export function fetchSeedCapabilities (url) {
  return fetchLLSD(url, [
    'GetDisplayNames'
  ]).then(caps => {
    return caps
  }, error => console.error(error))
}
