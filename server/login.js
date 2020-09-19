'use strict'

const express = require('express')
const { checkSchema, validationResult } = require('express-validator')
const fetch = require('node-fetch')
const uuid = require('uuid').v4
const xmlrpc = require('xmlrpc')

const { usersDB } = require('./db')

const LOGIN_URL_HEADER = 'x-andromeda-login-url'
const LOGIN_CONTENT_TYPE_HEADER = 'x-andromeda-login-content-type'
const LOGIN_USER_ID_HEADER = 'x-andromeda-login-user-id'

// SL uses its own tls-certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

module.exports = [
  express.json(),
  checkSchema({
    [LOGIN_URL_HEADER]: {
      in: 'headers',
      optional: true,
      isURL: {
        protocols: ['http','https'],
        require_protocol: true,
        allow_underscores: true,
        allow_trailing_dot: true
      }
    },
    [LOGIN_CONTENT_TYPE_HEADER]: {
      in: 'headers',
      isIn: {
        options: ['llsd', 'xml-rpc']
      }
    },
    [LOGIN_USER_ID_HEADER]: {
      in: 'headers',
      optional: true,
      notEmpty: true
    },
    first: {
      in: 'body',
      isString: true,
      notEmpty: true
    },
    last: {
      in: 'body',
      isString: true,
      notEmpty: true
    },
    start: {
      in: 'body',
      isString: true,
      notEmpty: true
    },
    channel: {
      in: 'body',
      isString: true,
      notEmpty: true
    },
    version: {
      in: 'body',
      isString: true,
      notEmpty: true
    },
    platform: {
      in: 'body',
      isIn: {
        options: ['Mac', 'Win', 'Lin']
      }
    },
    platform_version: {
      in: 'body',
      isString: true,
      notEmpty: true
    },
    platform_string: {
      in: 'body',
      optional: true,
      isString: true,
      notEmpty: true
    },
    last_exec_event: {
      in: 'body',
      isInt: true
    },
    last_exec_duration: {
      in: 'body',
      optional: true,
      isInt: true
    },
    options: {
      in: 'body',
      isArray: true
    },
    agree_to_tos: {
      in: 'body',
      optional: true,
      exists: true
    },
    read_critical: {
      in: 'body',
      optional: true,
      exists: true
    },
    address_size: {
      in: 'body',
      optional: true,
      isInt: true
    }
  }),
  handleValidationErrors,
  getMacAddress,
  handleLogin
]

/**
 * Handle a login request to a grid.
 * @param {express.Request}      req   Express' request object.
 * @param {express.Response}     res   Express' response object.
 * @param {express.NextFunction} next  Call the next middleware.
 */
async function handleLogin (req, res, next) {
  try {
    const reqData = req.body

    const reqLoginURL = req.headers[LOGIN_URL_HEADER]
    const loginURL = reqLoginURL && reqLoginURL.length > 0
      ? new URL(reqLoginURL)
      : new URL('https://login.agni.lindenlab.com:443/cgi-bin/login.cgi')

    if (!loginURL || loginURL.hostname == null) {
      res.sendStatus(400).json({ message: 'no grid login url!' })
      return
    }

    if (req.headers[LOGIN_CONTENT_TYPE_HEADER] === 'llsd') {
      handleLLSD(req.app, res, loginURL, reqData)
    } else {
      handleXmlRpc(req.app, res, loginURL, reqData)
    }
  } catch (err) {
    next(err)
  }
}

/**
 * Handle a XML-RPC formatted login.
 * @param {express.Application} app   The express app.
 * @param {express.Response} res      Express response object.
 * @param {URL} loginURL              Login URL of the grid.
 * @param {object} reqData            Login info.
 */
function handleXmlRpc (app, res, loginURL, reqData) {
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

      res.status(body.statusCode || 500).json(body)
    } else {
      const didLogin = data.login === 'true'
      if (didLogin) {
        const generateSession = app.get('generateSession')
        const id = generateSession()
        res.setHeader('x-andromeda-session-id', id)
        res.json(data)
      } else {
        res.status(401).json(data)
      }
    }
  })
}

/**
 * Handle a LLSD formatted login.
 * @param {express.Application} app   The express app.
 * @param {express.Response} res      Express response object.
 * @param {URL} loginURL              Login URL of the grid.
 * @param {object} reqData            Login info.
 */
async function handleLLSD (app, res, loginURL, reqData) {
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

  if (fetchResult.ok && didLogin) {
    const generateSession = app.get('generateSession')
    const id = generateSession()
    res.type('application/llsd+xml')
    res.setHeader('x-andromeda-session-id', id)
    res.send(body)
  } else if (fetchResult.ok) {
    res.type('application/llsd+xml')
    res.status(fetchResult.status).send(body)
  } else {
    res.type(fetchResult.headers.get('content-type'))
    res.status(fetchResult.status).send(body)
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

function handleValidationErrors (req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.sendStatus(400)
  } else {
    next()
  }
}

/**
 * Generate or retrieve an ID/MAC Address for a user.
 * @param {express.Request}      req   Express' request object.
 * @param {express.Response}     res   Express' response object.
 * @param {express.NextFunction} next  Call the next middleware.
 */
async function getMacAddress (req, _res, next) {
  const addMac = mac => {
    // adding the needed mac-address
    req.body.mac = mac
    req.body.id0 = mac
    next()
  }

  // If it is a logged in user
  if (LOGIN_USER_ID_HEADER in req.headers && req.headers[LOGIN_USER_ID_HEADER].length > 0) {
    const userId = req.headers[LOGIN_USER_ID_HEADER]

    try {
      const user = await usersDB.get('org.couchdb.user:' + userId)

      if (
        user.mac != null &&
        // test the mac-address
        /(?:[a-fA-F\d]{1,2}:){5}[a-fA-F\d]{1,2}/i.test(user.mac)
      ) {
        addMac(user.mac)
        return
      } else {
        // Add a mac-address to the user
        let mac

        do {
          mac = generateMacAddress()
        } while (/^00:00/.test(mac))

        user.mac = mac
        await usersDB.insert(user)

        addMac(mac)
        return
      }
    } catch (err) {
      if (err.status !== 404) {
        next(err)
        return
      }
      const mac = generateMacAddressFromIP(req.ip)
      addMac(mac)
    }
  } else {
    // new and anonym user
    const mac = generateMacAddressFromIP(req.ip)
    addMac(mac)
  }
}

function generateMacAddress () {
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
