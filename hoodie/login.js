'use strict'

const url = require('url')
const xmlrpc = require('xmlrpc')

var macaddress
// the macaddress can be found in node version 0.12 in os.networkInterfaces()
require('macaddress').one((error, mac) => {
  if (!error) {
    macaddress = mac
  } else {
    macaddress = '00:00:00:00:00:00'
    console.error("Mac address wasn't found!")
  }
})

// SL uses its own tls-certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

// Sends a login request as a XML-RPC post to the grid
function processLogin (request, reply) {
  const reqData = request.payload

  var loginURL
  if (reqData.grid && typeof reqData.grid.url === 'string') {
    loginURL = url.parse(reqData.grid.url)
  } else {
    loginURL = {
      host: 'login.agni.lindenlab.com',
      port: 443,
      path: '/cgi-bin/login.cgi'
    }
  }
  if (!loginURL || loginURL.host == null) {
    reply(400)
    return
  }
  var xmlrpcClient = loginURL.protocol == null || loginURL.protocol === 'https:'
    ? xmlrpc.createSecureClient(loginURL)
    : xmlrpc.createClient(loginURL) // osgrid uses http for login ... why??

  reqData.mac = getMacAddress(request) // adding the needed mac-address

  ;[
    'grid',
    'viewerUserId'
  ].forEach(key => {
    reqData[key] = undefined
  })

  const method = 'login_to_simulator'

  xmlrpcClient.methodCall(method, [reqData], function (err, data) {
    if (err) {
      reply(err)
    } else {
      var response = reply(undefined, data)
      response.type('application/json')
    }
  })
}

exports.init = function loginInit (server) {
  server.route({
    method: 'POST',
    path: '/login',
    handler: processLogin
  })
}

function getMacAddress (request) {
  if ('viewerUserId' in request.payload) {
    return generateMacAddress(request.payload.viewerUserId)
  } else {
    return macaddress
  }
}

function generateMacAddress (userId) {
  // userId to ASCII Binary
  const result = Array.from(userId).reduce((mac, char) => {
    return mac + char.charCodeAt(0).toString(2).padStart(7, '0')
  }, '')
  // Transform into a hex-number
  // userId is one hex-number to log for a mac-address -> remove the first
  const num = parseInt(result, 2).toString(16).slice(1)

  let mac = ''
  for (let i = 0; i < 6; ++i) {
    const index = i * 2
    const sep = i === 0 ? '' : ':'
    mac += `${sep}${num.charAt(index)}${num.charAt(index + 1)}`
  }
  return mac
}
