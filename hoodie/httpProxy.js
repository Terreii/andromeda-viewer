'use strict'

const fetch = require('node-fetch')

function proxy (request, reply) {
  const fetchOptions = {
    method: request.payload.method,
    headers: {
      'content-type': request.payload.type,
      'user-agent': request.headers['user-agent'],
      origin: request.headers.origin,
      'accept-encoding': request.headers['accept-encoding'],
      'accept-language': request.headers['accept-language']
    },
    body: request.payload.body
  }

  fetch(request.headers['x-fetch-url'], fetchOptions).then(fetchResult => {
    fetchResult.text().then(body => {
      const response = reply(body)
      ;[
        'content-type',
        'x-ll-request-id'
      ].forEach(key => { response.headers[key] = fetchResult.headers.get(key) })
    })
  })
}

exports.init = function httpProxy (server) {
  server.route({
    method: 'POST',
    path: '/proxy',
    handler: proxy
  })
}
