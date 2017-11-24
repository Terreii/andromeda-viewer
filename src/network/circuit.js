/*
 * The circuit is the connection to the sim server
 *
 * Is a EventEmitter
 * emits on a packet in an event with the name of the message type
 * and the event 'packetReceived'
 */

import events from 'events'

import { parseBody, createBody } from './networkMessages'

export default class Circuit extends events.EventEmitter {
  constructor (hostIP, hostPort, circuitCode) {
    super()
    this.ip = hostIP
    this.ipArray = this.ip.split('.').map(part => Number(part))
    this.port = hostPort
    this.circuitCode = circuitCode
    // sequenceNumber is the id of a packet. It will be increased for every packed
    this.sequenceNumber = 0
    this.senderSequenceNumber = 0

    this.websocketIsOpen = false
    const socketUrl = new window.URL(window.location.href.replace(/#.*$/, ''))
    if (process.env.NODE_ENV !== 'production' && socketUrl.hostname === 'localhost') {
      socketUrl.port = 8080
    }
    // http -> ws  &  https -> wss
    socketUrl.protocol = socketUrl.protocol.replace(/^http/, 'ws')
    socketUrl.pathname = '/andromeda-bridge'
    this.websocket = new window.WebSocket(socketUrl.toString())
    this.websocket.binaryType = 'arraybuffer'
    this.websocket.onopen = this._onOpen.bind(this)
    this.cachedMessages = []
    this.websocket.onmessage = this._onMessage.bind(this)

    this.acks = []

    setTimeout(() => this._sendAcks(), 100)
  }

  _onOpen () {
    this.websocketIsOpen = true
    this.cachedMessages.forEach(buffer => this.websocket.send(buffer))
    this.cachedMessages = []
  }

  _onMessage (message) {
    const msg = Buffer.from(message.data)

    const ip = msg.readUInt8(0) + '.' +
      msg.readUInt8(1) + '.' +
      msg.readUInt8(2) + '.' +
      msg.readUInt8(3)
    const port = msg.readUInt16LE(4)

    // extract the flags
    let flags = msg.readUInt8(6)
    const flagCheck = function (bit) {
      const is = flags >= bit
      if (is) {
        flags -= bit
      }
      return is
    }
    const isZeroEncoded = flagCheck(128)
    const isReliable = flagCheck(64)
    const isResent = flagCheck(32)
    const hasAck = flagCheck(16)

    const senderSequenceNumber = msg.readUInt32BE(7)
    this.senderSequenceNumber = senderSequenceNumber

    const bodyStart = msg.readUInt8(11) + 12

    const msgBody = msg.slice(bodyStart)

    const decodedBody = isZeroEncoded ? zeroDecode(msgBody) : msgBody

    const parsedBody = parseBody(decodedBody)

    const acks = hasAck ? extractAcks(msg) : []

    if (isReliable) {
      this.acks.push({
        didSendAcksMsg: false, // was send with a 'PacketAck' message
        onMessageSendCount: 0, // was send on another message
        sequenceNumber: senderSequenceNumber
      })
    }

    const toEmitObj = {
      isZeroEncoded: isZeroEncoded,
      isReliable: isReliable,
      isResent: isResent,
      body: parsedBody,
      hasAck: hasAck,
      acks: acks,
      ip,
      port
    }

    if (parsedBody.name === 'StartPingCheck') {
      this.send('CompletePingCheck', {
        PingID: [
          {
            PingID: parsedBody.PingID.data[0].PingID.value
          }
        ]
      })
      return
    }
    this.emit(parsedBody.name, toEmitObj)
    this.emit('packetReceived', toEmitObj) // for debugging
  }

  // Send a Packet.
  // Uses networkMessages to construct the body
  // messageType must be a string matching one of the names of message templates
  // http://secondlife.com/app/message_template/master_message_template.msg
  send (messageType, data, reliable = false) {
    // if no message with the type of messageType exist, than createBody will
    // throw an error
    const body = createBody(messageType, data)

    // http://wiki.secondlife.com/wiki/Packet_Layout
    const header = Buffer.alloc(6)
    header.writeUInt8(0, 0) // Buffer doesn't start with 0s
    header.writeUInt32BE(this.sequenceNumber, 1)
    this.sequenceNumber++
    if (this.sequenceNumber > 4294967295) {
      this.sequenceNumber = 0
    }
    header.writeUInt8(0, 5)

    // Set header byte 0 flags

    if (body.needsZeroencode) {
      header.writeUInt8(header.readUInt8(0) + 128, 0) // LL_ZERO_CODE_FLAG 0x80
      body.buffer = zeroEncode(body.buffer)
    }

    let acksBuffer
    if (this.acks.length > 0 && messageType !== 'PacketAck') {
      header.writeUInt8(header.readUInt8(0) + 16, 0) // LL_ACK_FLAG 0x10
      acksBuffer = this._createAcksBuffer()
    } else {
      acksBuffer = Buffer.alloc(0)
    }

    if (reliable) {
      header.writeUInt8(header.readUInt8(0) + 64, 0)
      // TODO: Add acks and body storing for outgoing messages.
    }

    const ipPort = Buffer.alloc(6)
    for (var i = 0; i < 4; i++) {
      ipPort.writeUInt8(this.ipArray[i], i)
    }
    ipPort.writeUInt16LE(this.port, 4)

    const packet = Buffer.concat([ipPort, header, body.buffer, acksBuffer])

    if (this.websocketIsOpen) {
      this.websocket.send(packet.buffer)
    } else {
      this.cachedMessages.push(packet)
    }
  }

  // Get acks that still needs to be send for given send method.
  // forAcksMessage true if it is for a 'PacketAck' message.
  _getSimAcks (forAcksMessage) {
    if (this.acks.length === 0) return []

    return this.acks.filter(ack => {
      return forAcksMessage ? !ack.didSendAcksMsg : ack.onMessageSendCount < 2
    }).map(ack => ack.sequenceNumber)
  }

  // Mark acks as send and filters out acks that are send enough.
  // forAcksMessage true if it is for a 'PacketAck' message.
  _setSimAcksToSend (forAcksMessage) {
    const newAcks = []
    for (let i = 0, max = this.acks.length; i < max; i += 1) {
      const ack = this.acks[i]

      if (forAcksMessage) { // ack was send with PacketAck message
        ack.didSendAcksMsg = true
      } else { // ack was send on a Package
        ack.onMessageSendCount += 1
      }

      // add acks that need to be send.
      if (!ack.didSendAcksMsg || ack.onMessageSendCount < 2) {
        newAcks.push(ack)
      }
    }
    this.acks = newAcks
  }

  // Adds the Acks
  _createAcksBuffer () {
    const acks = this._getSimAcks(false)
    if (acks.length === 0) return Buffer.from([0])

    const acksBuffer = Buffer.alloc((acks.length * 4) + 1)

    acks.forEach((ack, i) => {
      ack = +ack // to Number
      if (Number.isNaN(ack)) {
        ack = 0
      }
      acksBuffer.writeUInt32LE(ack, i * 4)
    })

    acksBuffer.writeUInt8(acks.length, acksBuffer.length - 1)
    this._setSimAcksToSend(false)

    return acksBuffer
  }

  // Sends all acks after 200ms
  _sendAcks () {
    setInterval(() => {
      if (this.acks.length > 0) {
        const acks = this._getSimAcks(true)
        if (acks.length === 0) return

        const data = {
          Packets: acks.map(ack => {
            return {
              ID: ack
            }
          })
        }

        this._setSimAcksToSend(true)
        this.send('PacketAck', data, true)
      }
    }, 200)
  }
}

// 0's in packet body are run length encoded, such that series of 1 to 255 zero
// bytes are encoded to take 2 bytes.
function zeroEncode (inputbuf) {
  const data = []
  let zero = false
  let zeroCount = 0

  for (let i = 0; i < inputbuf.length; i++) {
    const byte = inputbuf.readUInt8(i)
    if (byte !== 0) {
      if (zeroCount !== 0) {
        data.push(zeroCount)
        zeroCount = 0
        zero = false
      }
      data.push(byte)
    } else {
      if (zero === false) {
        data.push(byte)
        zero = true
      }
      zeroCount++
    }
  }
  if (zeroCount !== 0) {
    data.push(zeroCount)
  }
  return Buffer.from(data)
}

// decodes zeroencoded bodies
function zeroDecode (inputbuf) {
  const data = []
  let inZero = false

  for (let i = 0; i < inputbuf.length; i++) {
    const byte = inputbuf.readUInt8(i)
    if (byte !== 0) {
      if (inZero === true) {
        let zeroCount = byte - 1
        while (zeroCount > 0) {
          data.push(0)
          zeroCount--
        }
        inZero = false
      } else {
        data.push(byte)
      }
    } else {
      data.push(byte)
      inZero = true
    }
  }
  return Buffer.from(data)
}

// Extracts the Acks
// for what acks are used is unknown to me
function extractAcks (msg) {
  let offset = msg.length - 1 // in the last byte is the number of acks stored
  const acks = []
  // it reads the acks backwards
  for (let count = msg.readUInt8(offset); count > 0; count--) {
    offset -= 4
    acks.push(msg.readUInt32LE(offset))
  }
  acks.reverse()
  return acks
}
