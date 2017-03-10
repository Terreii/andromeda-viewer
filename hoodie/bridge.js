'use strict'

const dgram = require('dgram')

const WebSocket = require('ws')

const openBridges = new WeakMap() // all Bridges will be stored here.
// If a Bridge closes it will set its socket to undefined. the WeakMap will then
// garbage collect the Bridge

// The Bridge stores the websocket to the client and the UDP-socket to the sim
// the first 6 bytes of a message, between this server and a client, is the
// IP and Port of the sim
class Bridge {
  constructor (socket) {
    this.socket = socket
    const udp = dgram.createSocket('udp4')
    this.udp = udp
    udp.bind()

    const onClose = this.onClose.bind(this)
    socket.on('message', this.clientToGrid.bind(this))
    socket.on('close', onClose)

    udp.on('message', this.gridToClient.bind(this))
    udp.on('close', onClose)
  }

  clientToGrid (message) {
    if (message instanceof Buffer) {
      const ip = message.readUInt8(0) + '.' +
        message.readUInt8(1) + '.' +
        message.readUInt8(2) + '.' +
        message.readUInt8(3)
      const port = message.readUInt16LE(4)

      const buffy = message.slice(6)
      this.udp.send(buffy, 0, buffy.length, port, ip)
    }
  }

  gridToClient (message, rinfo) {
    const buffy = Buffer.concat([
      new Buffer(6),
      message
    ])
    // add IP address
    const ipParts = rinfo.address.split('.')
    for (var i = 0; i < 4; i++) {
      buffy.writeUInt8(Number(ipParts[i]), i)
    }
    // add port
    buffy.writeUInt16LE(rinfo.port, 4)

    this.socket.send(buffy, { binary: true })
  }

  onClose () {
    if (this.udp) {
      this.udp.close()
      this.udp = undefined
    }
    if (this.socket) {
      this.socket.close()
      this.socket = undefined
    }
  }
}

exports.init = function bridgeInit (server) {
  const wss = new WebSocket.Server({
    server: server.listener,
    perMessageDeflate: false,
    path: '/andromeda-bridge'
  })
  wss.on('connection', ws => openBridges.set(ws, new Bridge(ws)))
}
