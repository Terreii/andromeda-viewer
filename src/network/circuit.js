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

    this.simAcks = []
    this.viewerAcks = []

    setTimeout(() => this._startAcksProcess(), 100)
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
      this.simAcks.push({
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

    if (acks.length > 0) {
      this._filterViewerAcks(acks)
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
    } else if (parsedBody.name === 'PacketAck') {
      this._filterViewerAcks(parsedBody.Packets.data.map(data => data.ID.value))
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

    const acksBuffer = this.simAcks.length > 0 && messageType !== 'PacketAck'
      ? this._createAcksBuffer()
      : Buffer.alloc(0)

    const bodyBuffer = body.needsZeroEncode ? zeroEncode(body.buffer) : body.buffer

    const ipPort = Buffer.alloc(6)
    for (var i = 0; i < 4; i++) {
      ipPort.writeUInt8(this.ipArray[i], i)
    }
    ipPort.writeUInt16LE(this.port, 4)

    this._combineAndSend(ipPort, bodyBuffer, acksBuffer, reliable, body.needsZeroEncode, 0)
  }

  _combineAndSend (target, body, acks, reliable, zeroEncoded, resentCount) {
    // http://wiki.secondlife.com/wiki/Packet_Layout

    // Set header byte 0 flags
    const flags = [
      zeroEncoded,
      reliable,
      resentCount > 0,
      acks.byteLength > 0,
      false,
      false,
      false,
      false
    ].reduce((flags, flag) => (flags << 1) | (flag << 0))

    const header = Buffer.from([flags, 0, 0, 0, 0, 0])

    const sequenceNumber = this.sequenceNumber
    header.writeUInt32BE(sequenceNumber, 1)
    this.sequenceNumber++
    if (this.sequenceNumber > 4294967295) {
      this.sequenceNumber = 0
    }

    const packet = Buffer.concat([target, header, body, acks])

    if (this.websocketIsOpen) {
      this.websocket.send(packet)
    } else {
      this.cachedMessages.push(packet)
    }

    if (reliable && resentCount < 4) {
      this.viewerAcks.push({
        sequenceNumber,
        target,
        body,
        acks,
        zeroEncoded,
        resentCount,
        time: Date.now()
      })
    }
  }

  // Get acks that still needs to be send for given send method.
  // forAcksMessage true if it is for a 'PacketAck' message.
  _getSimAcks (forAcksMessage) {
    if (this.simAcks.length === 0) return []

    return this.simAcks.filter(ack => {
      return forAcksMessage ? !ack.didSendAcksMsg : ack.onMessageSendCount < 2
    }).map(ack => ack.sequenceNumber)
  }

  // Mark acks as send and filters out acks that are send enough.
  // forAcksMessage true if it is for a 'PacketAck' message.
  _setSimAcksToSend (forAcksMessage) {
    const newAcks = []
    for (let i = 0, max = this.simAcks.length; i < max; i += 1) {
      const ack = this.simAcks[i]

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
    this.simAcks = newAcks
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

  // resend packages and send ack-message every 200ms
  _startAcksProcess () {
    setInterval(() => {
      if (this.simAcks.length > 0) {
        this._sendAcks()
      }
      if (this.viewerAcks.length > 0) {
        this._resendPackages()
      }
    }, 200)
  }

  // Sends all acks after 200ms
  _sendAcks () {
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

  // Filter received acks out from the viewerAcks array
  _filterViewerAcks (acks) {
    if (acks.length === 0) return
    this.viewerAcks = this.viewerAcks.filter(viewerAck => !acks.includes(viewerAck.sequenceNumber))
  }

  // Resend packages if they have bin send more than 500ms ago, and haven't been filtered out.
  _resendPackages () {
    const now = Date.now() - 500 // 500ms
    const toSendPackages = this.viewerAcks.filter(ack => ack.time < now)
    if (toSendPackages.length === 0) return

    this._filterViewerAcks(toSendPackages.map(ack => ack.sequenceNumber))

    toSendPackages.forEach(ack => {
      const count = ack.resentCount + 1
      this._combineAndSend(ack.target, ack.body, ack.acks, true, ack.zeroEncoded, count)
    })
  }
}

// 0's in packet body are run length encoded, such that series of 1 to 255 zero
// bytes are encoded to take 2 bytes.
function zeroEncode (inputBuffer) {
  const data = []
  let zeroCount = 0 // how many zeros are encoded before this byte

  for (const byte of inputBuffer) {
    if (byte === 0) {
      if (zeroCount === 0) {
        data.push(byte)
      }
      zeroCount += 1
    } else {
      if (zeroCount > 0) {
        data.push(zeroCount)
        zeroCount = 0
      }
      data.push(byte)
    }
  }

  if (zeroCount !== 0) {
    data.push(zeroCount)
  }
  return Buffer.from(data)
}

// decodes zeroEncoded bodies
function zeroDecode (inputBuffer) {
  const data = []
  let inZero = false

  for (const byte of inputBuffer) {
    if (byte === 0) {
      inZero = true
      continue
    }
    if (inZero) {
      let zeroCount = byte
      while (zeroCount > 0) {
        data.push(0)
        zeroCount -= 1
      }
      inZero = false
    } else {
      data.push(byte)
    }
  }
  return Buffer.from(data)
}

// Extracts the Acks
// Acks are the sequence number. They are used to indicate that a package was received.
function extractAcks (msg) {
  let offset = msg.length - 1 // in the last byte is the number of acks stored
  const acks = []
  // it reads the acks backwards
  for (let count = msg.readUInt8(offset); count > 0; count--) {
    offset -= 4
    acks.push(msg.readUInt32LE(offset))
  }
  return acks
}
