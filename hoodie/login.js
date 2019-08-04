'use strict'

const url = require('url')
const xmlrpc = require('xmlrpc')
const uuid = require('uuid').v4

module.exports = loginInit

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
      const viewerData = reqData.viewerData // special data for the viewer
      delete reqData.viewerData // that shouldn't be send to the grid

      let loginURL
      if (viewerData.grid && typeof viewerData.grid.url === 'string') {
        loginURL = new url.URL(viewerData.grid.url)
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
      const xmlrpcClient = loginURL.protocol == null || loginURL.protocol === 'https:'
        ? xmlrpc.createSecureClient(loginURL)
        : xmlrpc.createClient(loginURL) // osgrid uses http for login ... why??

      reqData.mac = mac // adding the needed mac-address
      reqData.id0 = mac

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
          const response = reply(undefined, data)
          response.type('application/json')
        }
      })
    })
    .catch(function (err) {
      reply(err)
    })
}

async function getMacAddress (request) {
  const payload = request.payload
  const viewerData = payload.viewerData

  // If it is a logged in user
  if ('userId' in viewerData) {
    const accounts = request.server.plugins.account.api.accounts

    try {
      const user = await accounts.find(viewerData.userId, { include: 'profile' })

      if (
        user.profile != null &&
        // test the mac-address
        /(?:[a-fA-F\d]{1,2}:){5}[a-fA-F\d]{1,2}/i.test(user.profile.mac)
      ) {
        return user.profile.mac
      } else {
        // Add a mac-address to the user
        const updated = await accounts.update(viewerData.userId, user => {
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
