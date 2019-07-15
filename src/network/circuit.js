/*
 * The circuit is the connection to the sim server
 *
 * Is a EventEmitter
 * emits on a packet in an event with the name of the message type
 * and the event 'packetReceived'
 */

import events from 'events'
import Deque from 'double-ended-queue'

import { parseBody, createBody } from './networkMessages'
import { getValueOf, mapBlockOf } from './msgGetters'

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
    // http -> ws  &  https -> wss
    socketUrl.protocol = socketUrl.protocol.replace(/^http/, 'ws')
    socketUrl.pathname = '/andromeda-bridge'
    this.websocket = new window.WebSocket(socketUrl.toString())
    this.websocket.binaryType = 'arraybuffer'
    this.websocket.onopen = this._onOpen.bind(this)
    this.cachedMessages = []
    this.websocket.onmessage = this._onMessage.bind(this)

    this.simAcks = new Map()
    this.simAcksOnPacket = new Deque()
    this.viewerAcks = []

    setTimeout(() => this._startAcksProcess(), 100)
  }

  _onOpen () {
    this.websocketIsOpen = true
    this.cachedMessages.forEach(buffer => this.websocket.send(buffer))
    this.cachedMessages = []
  }

  close () {
    this.websocket.close()
    this.removeAllListeners()
    clearInterval(this.acksProcessInterval)
  }

  _onMessage (message) {
    const msg = Buffer.from(message.data)

    const ip = msg.readUInt8(0) + '.' +
      msg.readUInt8(1) + '.' +
      msg.readUInt8(2) + '.' +
      msg.readUInt8(3)
    const port = msg.readUInt16LE(4)

    // extract the flags
    const flags = msg.readUInt8(6)
    const isZeroEncoded = (flags & 0b10000000) > 0 // 128
    const isReliable = (flags & 0b01000000) > 0 // 64
    const isResend = (flags & 0b00100000) > 0 // 32
    const hasAck = (flags & 0b00010000) > 0 // 16

    const senderSequenceNumber = msg.readUInt32BE(7)
    this.senderSequenceNumber = senderSequenceNumber

    const bodyStart = msg.readUInt8(11) + 12

    const msgBody = msg.slice(bodyStart)

    const decodedBody = isZeroEncoded ? zeroDecode(msgBody) : msgBody

    const parsedBody = parseBody(decodedBody, ip, port, isResend, isReliable)

    if (isReliable) {
      this.simAcks.set(senderSequenceNumber, 0) // was send with a 'PacketAck' message
      this.simAcksOnPacket.push(senderSequenceNumber) // was send on another message
    }

    const acks = hasAck ? extractAcks(msg) : []
    if (acks.length > 0) {
      this._resolveAcks(acks)
    }
    if (parsedBody.name === 'StartPingCheck') {
      this.send('CompletePingCheck', {
        PingID: [
          {
            PingID: getValueOf(parsedBody, 'PingID', 0, 'PingID')
          }
        ]
      })
    } else if (parsedBody.name === 'CompletePingCheck') {
      // TODO: use the ping time
    } else if (parsedBody.name === 'PacketAck') {
      this._resolveAcks(mapBlockOf(parsedBody, 'Packets', getValue => getValue('ID')))
    } else {
      // For every message that is not a circuit control message
      this.emit(parsedBody.name, parsedBody)
      this.emit('packetReceived', parsedBody)
    }
  }

  // Send a Packet.
  // Uses networkMessages to construct the body
  // messageType must be a string matching one of the names of message templates
  // http://secondlife.com/app/message_template/master_message_template.msg
  send (messageType, data, reliable = false) {
    // if no message with the type of messageType exist, than createBody will
    // throw an error
    const body = createBody(messageType, data)

    const bodyBuffer = body.needsZeroEncode ? zeroEncode(body.buffer) : body.buffer

    const acksBuffer = !this.simAcksOnPacket.isEmpty() && messageType !== 'PacketAck'
      ? this._createAcksBuffer(1200 - bodyBuffer.length) // save space for acks that is left
      : Buffer.alloc(0)

    const ipPort = Buffer.alloc(6)
    for (var i = 0; i < 4; i++) {
      ipPort.writeUInt8(this.ipArray[i], i)
    }
    ipPort.writeUInt16LE(this.port, 4)

    const promiseCallbacks = {
      resolve: () => {},
      reject: () => {}
    }

    this._combineAndSend(
      ipPort, bodyBuffer, acksBuffer, reliable, body.needsZeroEncode, 0, promiseCallbacks
    )

    if (reliable) {
      return new Promise((resolve, reject) => {
        promiseCallbacks.resolve = resolve
        promiseCallbacks.reject = reject
      })
    }
  }

  _combineAndSend (target, body, acks, reliable, zeroEncoded, resentCount, promise) {
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
        promise,
        time: Date.now()
      })
    }
  }

  // Adds the Acks
  _createAcksBuffer (allowedSaveSpace) {
    const acks = []
    while (!this.simAcksOnPacket.isEmpty() && acks.length < 255 && 4 + 1 < allowedSaveSpace) {
      const ack = this.simAcksOnPacket.shift()
      acks.push(ack)
      allowedSaveSpace -= 4
    }

    if (acks.length === 0) return Buffer.from([0])

    const acksBuffer = Buffer.alloc((acks.length * 4) + 1)

    acks.forEach((ack, index) => {
      ack = +ack // to Number
      if (Number.isNaN(ack)) {
        ack = 0
      }
      acksBuffer.writeUInt32BE(ack, index * 4)
    })

    acksBuffer.writeUInt8(acks.length, acksBuffer.length - 1)

    return acksBuffer
  }

  // resend packages and send ack-message every 200ms
  _startAcksProcess () {
    let pingId = 0
    this.acksProcessInterval = setInterval(() => {
      this._sendAcks()

      if (this.viewerAcks.length > 0) {
        this._resendPackages()
      }

      this.send('StartPingCheck', {
        PingID: [
          {
            PingID: pingId,
            OldestUnacked: this.simAcksOnPacket.isEmpty() ? 0 : this.simAcksOnPacket.peekFront()
          }
        ]
      })
      pingId = pingId === 255 ? 0 : pingId + 1
    }, 100)
  }

  // Sends all acks after 100ms
  _sendAcks () {
    const acks = []
    const toDelete = []
    for (const [sequenceNumber, timesSend] of this.simAcks) {
      acks.push({
        ID: sequenceNumber
      })

      if (timesSend === 0) {
        this.simAcks.set(sequenceNumber, timesSend + 1)
      } else {
        toDelete.push(sequenceNumber)
      }
    }

    toDelete.forEach(sequenceNumber => {
      this.simAcks.delete(sequenceNumber)
    })

    this.send('PacketAck', {
      Packets: acks
    })
  }

  // Resolves the Promises of reliable Messages and filters them out
  _resolveAcks (acks) {
    if (acks.length === 0) return

    for (const ack of this.viewerAcks.filter(ack => acks.includes(ack.sequenceNumber))) {
      ack.promise.resolve()
    }

    this._filterViewerAcks(acks)
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

      // if the reliable msg was send 4 times, then it rejects
      if (count >= 4) {
        ack.promise.reject(new Error('Server did timeout'))
        return
      }

      this._combineAndSend(
        ack.target, ack.body, ack.acks, true, ack.zeroEncoded, count, ack.promise
      )
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
    acks.push(msg.readUInt32BE(offset))
  }
  return acks
}
