'use strict'

module.exports = function httpProxy (server) {
  ;[
    // 'HEAD' is not allowed! It is the same as GET
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'CONNECT',
    'OPTIONS',
    'TRACE',
    'PATCH'
  ].forEach(method => {
    server.route({
      method,
      path: '/proxy/{protocol}/{hostname}/{path*}',
      handler: {
        proxy: {
          redirects: 10,
          mapUri,
          onResponse
        }
      }
    })
  })
}

function mapUri (request, callback) {
  const sessionId = request.headers['x-andromeda-session-id']

  request.server.methods.checkSession(sessionId, (err, state) => {
    if (err) {
      callback(err)
      return
    }

    const protocol = request.params.protocol
    const hostname = request.params.hostname
    const path = request.params.path || ''

    const url = new URL(`${protocol}://${hostname}/${path}`)

    for (const headerName in request.query) {
      const value = request.query[headerName]

      if (Array.isArray(value)) {
        for (const param of value) {
          url.searchParams.append(headerName, param)
        }
      } else {
        url.searchParams.append(headerName, value)
      }
    }

    const headers = Object.assign({}, request.headers || {})
    delete headers['x-andromeda-session-id']
    headers.host = url.hostname

    callback(null, url.href, headers)
  })
}

function onResponse (err, res, request, reply, settings, ttl) {
  if (err) {
    reply(err, res)
    return
  }

  const response = reply(null, res)
  response.headers = res.headers
}
