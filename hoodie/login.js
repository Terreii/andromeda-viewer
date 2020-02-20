'use strict'

const xmlrpc = require('xmlrpc')
const fetch = require('node-fetch')
const uuid = require('uuid').v4

module.exports = loginInit

const LOGIN_URL_HEADER = 'x-andromeda-login-url'
const LOGIN_CONTENT_TYPE_HEADER = 'x-andromeda-login-content-type'
const LOGIN_USER_ID_HEADER = 'x-andromeda-login-user-id'

// SL uses its own tls-certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

function loginInit (server) {
  server.route({
    method: 'POST',
    path: '/login',
    handler: processLogin
  })
}

// Sends a login request as a XML-RPC post to the grid
function processLogin (request, reply) {
  getMacAddress(request)
    .then(function (mac) {
      const reqData = request.payload

      const reqLoginURL = request.headers[LOGIN_URL_HEADER]
      const loginURL = reqLoginURL && reqLoginURL.length > 0
        ? new URL(reqLoginURL)
        : new URL('https://login.agni.lindenlab.com:443/cgi-bin/login.cgi')

      if (!loginURL || loginURL.host == null) {
        reply(400, { message: 'no grid login url!' })
        return
      }

      // adding the needed mac-address
      reqData.mac = mac
      reqData.id0 = mac

      if (request.headers[LOGIN_CONTENT_TYPE_HEADER] === 'llsd') {
        handleLLSD(request.server, reply, loginURL, reqData)
      } else {
        handleXmlRpc(request.server, reply, loginURL, reqData)
      }
    })
    .catch(function (err) {
      reply(err)
    })
}

function handleXmlRpc (server, reply, loginURL, reqData) {
  const xmlrpcClient = loginURL.protocol == null || loginURL.protocol === 'https:'
    ? xmlrpc.createSecureClient(loginURL)
    : xmlrpc.createClient(loginURL) // osgrid uses http for login ... why??

  xmlrpcClient.methodCall('login_to_simulator', [reqData], (err, data) => {
    if (err) {
      const body = err.body != null
        ? {
          statusCode: (err.res && err.res.statusCode) || 500,
          error: 'Login fail',
          message: err.body
        }
        : err

      const response = reply(body)
      response.type('application/json')
      response.statusCode = body.statusCode
    } else {
      const didLogin = data.login === 'true'
      if (didLogin) {
        server.methods.generateSession((err, id) => {
          if (err) {
            reply(err)
            return
          }
          const response = reply(undefined, data)
          response.type('application/json')
          response.header('x-andromeda-session-id', id)
        })
      } else {
        const response = reply(undefined, data)
        response.type('application/json')
      }
    }
  })
}

async function handleLLSD (server, reply, loginURL, reqData) {
  const fetchResult = await fetch(loginURL, {
    method: 'POST',
    headers: {
      'content-type': 'application/llsd+xml'
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
    <llsd>${stringifyLLSD(reqData)}</llsd>
    `
  })
  const body = await fetchResult.text()
  const didLogin = body.includes('<key>login</key><string>true</string>')

  if (fetchResult.status < 300 && didLogin) {
    server.methods.generateSession((err, id) => {
      if (err) {
        reply(err)
      } else {
        const response = reply(undefined, body)
        response.statusCode = fetchResult.status
        response.type('application/llsd+xml')
        response.header('x-andromeda-session-id', id)
      }
    })
  } else if (fetchResult.status < 300) {
    const response = reply(undefined, body)
    response.statusCode = fetchResult.status
    response.type('application/llsd+xml')
  } else {
    const response = reply(body)
    response.statusCode = fetchResult.status
    response.type(fetchResult.headers.get('content-type'))
  }
}

function stringifyLLSD (value) {
  switch (typeof value) {
    case 'boolean':
      return `<boolean>${value.toString()}</boolean>`
    case 'number':
      if ((value << 0) === value) {
        // is an int
        return `<integer>${value}</integer>`
      } else {
        // is a double
        return `<real>${value}</real>`
      }
    case 'string':
      return `<string>${value}</string>`
    case 'object':
      if (Array.isArray(value)) {
        return `<array>${value.map(stringifyLLSD).join('')}</array>`
      } else {
        const mapBody = Object.keys(value)
          .map(key => `<key>${key}</key>${stringifyLLSD(value[key])}`)
        return `<map>${mapBody.join('')}</map>`
      }
    case 'undefined':
    default:
      return '<undef />'
  }
}

async function getMacAddress (request) {
  // If it is a logged in user
  if (LOGIN_USER_ID_HEADER in request.headers && request.headers[LOGIN_USER_ID_HEADER].length > 0) {
    const accounts = request.server.plugins.account.api.accounts
    const userId = request.headers[LOGIN_USER_ID_HEADER]

    try {
      const user = await accounts.find(userId, { include: 'profile' })

      if (
        user.profile != null &&
        // test the mac-address
        /(?:[a-fA-F\d]{1,2}:){5}[a-fA-F\d]{1,2}/i.test(user.profile.mac)
      ) {
        return user.profile.mac
      } else {
        // Add a mac-address to the user
        const updated = await accounts.update(userId, user => {
          let mac

          do {
            mac = generateMacAddress()
          } while (/^00:00/.test(mac))

          const profile = user.profile || {}
          profile.mac = mac
          user.profile = profile
          return user
        }, {
          include: 'profile'
        })

        return updated.profile.mac
      }
    } catch (err) {
      return generateMacAddressFromIP(request.info.remoteAddress)
    }
  } else {
    // new and anonym user
    return generateMacAddressFromIP(request.info.remoteAddress)
  }
}

function generateMacAddress (userId) {
  // generate a UUID and transform it into a "MAC"-address
  const num = uuid().replace(/-/g, '').slice(0, 12)

  let mac = ''
  for (let i = 0; i < 6; ++i) {
    const index = i * 2
    const sep = i === 0 ? '' : ':'
    mac += `${sep}${num.charAt(index)}${num.charAt(index + 1)}`
  }
  return mac
}

function generateMacAddressFromIP (ip) {
  const ip4 = ip.split('.')
  if (ip4.length === 4) {
    const hexNum = ip4.map(part => parseInt(part, 10).toString(16).padStart(2, '0'))
    return '00:00:' + hexNum.join(':')
  }

  // is IPv6
  const ip6 = ip.replace(/:/g, '')
  let resultAddress = ''

  for (let i = 0; i < 12; ++i) {
    const index = ip6.length - (i + 1)
    const char = index < 0 ? '0' : ip6.charAt(index)
    resultAddress = char + resultAddress

    if (i % 2 === 1) {
      resultAddress = ':' + resultAddress
    }
  }
  return resultAddress.substring(1)
}
