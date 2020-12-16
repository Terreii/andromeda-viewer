'use strict'

exports.createWebSocketServer = createWebSocketServer
exports.createWebSocketCreationRoute = createWebSocketCreationRoute

const dgram = require('dgram')

const pouchdbErrors = require('pouchdb-errors')
const webSocket = require('ws')

// all Bridges will be stored here.
// If a Bridge closes it will set its socket to undefined. the WeakMap will then
// garbage collect the Bridge
const openBridges = new WeakMap()

/**
 * Creates a middleware that will add a WebSocket server on to the server,
 * when the first request is made.
 * This is only for development!
 * Inspired by ws handling of http-proxy-middleware.
 *
 * @param {string} url   URL where to listen to.
 */
function createWebSocketCreationRoute (url) {
  let hasSubscribed = false
  let app
  const wss = new webSocket.Server({ noServer: true })

  wss.on('connection', ws => {
    openBridges.set(ws, new Bridge(ws, app))
  })

  return (req, res, next) => {
    if (!hasSubscribed) {
      hasSubscribed = true
      app = req.app

      // manuel handle upgrade
      req.connection.server.on('upgrade', (request, socket, head) => {
        if (request.url === url) {
          wss.handleUpgrade(request, socket, head, ws => {
            wss.emit('connection', ws, request)
          })
        }
      })
    }
    next()
  }
}

/**
 * Creates a WebSocket Server
 * @param {object} app     Express App.
 * @param {object} server  Node.js HTTP(S) server.
 * @param {string} url     URL where to listen to.
 */
function createWebSocketServer (app, server, url) {
  const wss = new webSocket.Server({
    server,
    perMessageDeflate: false,
    path: url
  })

  wss.on('connection', ws => {
    openBridges.set(ws, new Bridge(ws, app))
  })
}

// The Bridge stores the websocket to the client and the UDP-socket to the sim
// the first 6 bytes of a message, between this server and a client, is the
// IP and Port of the sim
class Bridge {
  constructor (socket, app) {
    this.didAuth = false
    this.sessionId = ''

    this.checkSession = app.get('checkSession')
    this.changeSessionState = app.get('changeSessionState')

    this.socket = socket
    this.udp = null

    socket.on('message', this.clientToGrid.bind(this))
    socket.on('close', this.onSocketClose.bind(this))
  }

  authenticate (sessionId) {
    try {
      const state = this.checkSession(sessionId)

      if (state === 'inactive') {
        // Session has no active socket -> open
        this.didAuth = true
        this.changeSessionState(sessionId, 'active')
        this.sessionId = sessionId

        const udp = dgram.createSocket('udp4')
        this.udp = udp
        udp.bind()

        udp.on('message', this.gridToClient.bind(this))
        udp.on('close', this.onUDPClose.bind(this))

        this.socket.send('ok')
      } else {
        // session did close or has an active socket -> close this socket
        this.socket.close(1008, 'already active socket open')
      }
    } catch (err) {
      // handle error
      if (err.status === pouchdbErrors.INVALID_REQUEST.status) {
        this.socket.close(1011, err.message)
      } else {
        this.socket.close(1008, 'wrong session id')
      }
    }
  }

  clientToGrid (message) {
    if (message instanceof Buffer && this.didAuth) {
      const ip = message.readUInt8(0) + '.' +
        message.readUInt8(1) + '.' +
        message.readUInt8(2) + '.' +
        message.readUInt8(3)
      const port = message.readUInt16LE(4)

      const buffy = message.slice(6)
      this.udp.send(buffy, 0, buffy.length, port, ip)
    } else if (!this.didAuth && typeof message === 'string') {
      this.authenticate(message)
    }
  }

  gridToClient (message, rinfo) {
    const buffy = Buffer.concat([
      Buffer.alloc(6),
      message
    ])
    // add IP address
    const ipParts = rinfo.address.split('.')
    for (let i = 0; i < 4; i++) {
      buffy.writeUInt8(Number(ipParts[i]), i)
    }
    // add port
    buffy.writeUInt16LE(rinfo.port, 4)

    this.socket.send(buffy, { binary: true })
  }

  onSocketClose (code, reason) {
    if (this.socket && this.sessionId !== '') {
      const nextState = code === 1000 ? 'end' : 'inactive'

      try {
        this.changeSessionState(this.sessionId, nextState)
      } catch (err) {
        console.error(err)
      }
    }

    if (this.socket) {
      this.socket = undefined
    }

    if (this.udp) {
      this.udp.close()
      this.udp = undefined
    }
  }

  onUDPClose () {
    if (this.udp) {
      this.udp = undefined
    }

    if (this.socket) {
      this.socket.close(1012, 'udp did close')
      this.socket = undefined
    }
  }
}
