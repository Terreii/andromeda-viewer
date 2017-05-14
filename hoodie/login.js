'use strict'

var url = require('url')
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

  reqData.mac = macaddress // adding the needed mac-address

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
    path: '/andromeda-login',
    handler: processLogin
  })
}
