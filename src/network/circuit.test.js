'use strict'

import Circuit from './circuit'

import {createBody, parseBody} from './networkMessages'

// Utility for testing
window.WebSocket = class WebSocket {
  constructor (url) {
    this.url = url

    this.sendMessages = []
  }

  send (buffer) {
    this.sendMessages.push(buffer)
    expect(buffer).toBeTruthy()
  }

  onopen () {}

  onmessage (buffer) {}

  getSendMessages (index = this.sendMessages.length - 1) {
    return this.sendMessages[index]
  }
}

let sequenceNumberForTests = 0
function createTestMessage (reliable, resend, hasAcks) {
  const body = createBody('TestMessage', {
    TestBlock1: [
      {
        Test1: 0
      }
    ],
    NeighborBlock: [
      {
        Test0: 0,
        Test1: 1,
        Test2: 2
      },
      {
        Test0: 3,
        Test1: 4,
        Test2: 5
      },
      {
        Test0: 6,
        Test1: 7,
        Test2: 8
      },
      {
        Test0: 9,
        Test1: 10,
        Test2: 11
      }
    ]
  })
  const headBuffer = createTestHeader(reliable, resend, hasAcks)
  const messageBuffer = Buffer.concat([headBuffer, body.buffer])

  return messageBuffer
}

function createTestHeader (reliable, resend, hasAcks) {
  const flags = (reliable ? 64 : 0) + (resend ? 32 : 0) + (hasAcks ? 16 : 0)
  const headBuffer = Buffer.from([127, 0, 0, 1, 33, 0, flags, 0, 0, 0, 0, 0])
  headBuffer.writeUInt32BE(sequenceNumberForTests, 7)
  sequenceNumberForTests += 1
  return headBuffer
}

const circuit = new Circuit('127.0.0.1', 8080, 123456)

test('it should create an instance', () => {
  expect(circuit instanceof Circuit).toBe(true)
  expect(circuit.circuitCode).toBe(123456)
  expect(circuit.ip).toBe('127.0.0.1')
  expect(circuit.ipArray).toEqual([127, 0, 0, 1])
  expect(circuit.port).toBe(8080)
  expect(circuit.websocket.url).toBe('ws://localhost:8080/andromeda-bridge')

  expect(circuit.websocketIsOpen).toBe(false)
})

test('circuit should save messages until the WebSocket is open and send if open', () => {
  circuit.send('PacketAck', {
    Packets: [
      {
        ID: 0
      }
    ]
  })

  expect(circuit.websocket.sendMessages.length).toBe(0)
  expect(circuit.cachedMessages.length).toBe(1)

  circuit.websocket.onopen()

  expect(circuit.websocketIsOpen).toBe(true)
  expect(circuit.cachedMessages.length).toBe(0)
  expect(circuit.websocket.sendMessages.length).toBe(1)

  circuit.send('PacketAck', {
    Packets: [
      {
        ID: 0
      }
    ]
  })

  expect(circuit.cachedMessages.length).toBe(0)
  expect(circuit.websocket.sendMessages.length).toBe(2)
})

test('parse a received package', () => {
  const messageBuffer = createTestMessage(false, false, false)

  const received = []
  circuit.on('packetReceived', message => {
    expect(message.body).toBeTruthy()
    received.push(message)
  })

  circuit.websocket.onmessage({data: messageBuffer})

  expect(received.length).toBe(1)
  expect(circuit.senderSequenceNumber).toBe(0)
  circuit.removeAllListeners()
})

test('save sender sequence number of reliable packages as ack', () => {
  const message1 = createTestMessage(true, false, false)
  const message2 = createTestMessage(true, false, false)

  const websocket = circuit.websocket
  websocket.onmessage({data: message1})
  websocket.onmessage({data: message2})

  expect(circuit.simAcks.length).toBe(2)
  expect(circuit.senderSequenceNumber).toBe(sequenceNumberForTests - 1)
})

test('send ack at end of package', () => {
  circuit.send('CompletePingCheck', {
    PingID: [
      {
        PingID: 0
      }
    ]
  })

  const sendMessages = circuit.websocket.sendMessages
  const last = sendMessages[sendMessages.length - 1]

  // Check if there are the correct number of acks
  expect(circuit.simAcks.length).toBe(2)
  expect(last.byteLength).toBe(23)
  expect((last.readUInt8(6) | 0x10) > 0).toBe(true)

  // Check if the acks are correct
  const offset = last.length - 1
  expect(last.readUInt8(offset)).toBe(2)
  expect([last.readUInt32LE(offset - 4), last.readUInt32LE(offset - 8)].sort()).toEqual([
    sequenceNumberForTests - 2,
    sequenceNumberForTests - 1
  ])
})

test('circuit should send after 200ms a PacketAck', done => {
  setTimeout(() => {
    // could be CompletePingCheck
    const ackMessage1 = circuit.websocket.sendMessages[circuit.websocket.sendMessages.length - 2]
    const ackMessage2 = circuit.websocket.sendMessages[circuit.websocket.sendMessages.length - 1]
    const parsedAckMessageA = parseBody(ackMessage1.slice(12))
    const parsedAckMessageB = parseBody(ackMessage2.slice(12))
    const parsedAckMessage = parsedAckMessageA.name === 'PacketAck'
      ? parsedAckMessageA
      : parsedAckMessageB

    expect(parsedAckMessage).toBeTruthy()
    expect(parsedAckMessage.Packets.data[0].ID.value).toBe(0)

    done()
  }, 250)
})

test('circuit should resend a package after 500ms', done => {
  setTimeout(() => {
    const last = circuit.websocket.getSendMessages()

    expect(last.readUInt8(6) | 32).toBeTruthy()

    done()
  }, 400)
})

describe('circuit should remove acks that the server has send back', () => {
  test('with the PacketAck', () => {
    const acksBody = createBody('PacketAck', {
      Packets: circuit.viewerAcks.map(ack => ({ID: ack.sequenceNumber}))
    })
    const header = createTestHeader(false, false, false)
    const message = Buffer.concat([header, acksBody.buffer])
    circuit.websocket.onmessage({data: message})

    expect(circuit.viewerAcks.length).toBe(0)
  })

  test('with acks at the end of a packet', () => {
    // create an ack
    circuit.send('OpenCircuit', {
      CircuitInfo: [
        {
          IP: '0.0.0.0',
          Port: 13
        }
      ]
    }, true)
    expect(circuit.viewerAcks.length).toBe(1)

    // test at the end of packet
    const messagePart1 = createTestMessage(false, false, true)

    // create Ack at end
    const acks = Buffer.from([0, 0, 0, 0, 1])
    acks.writeUInt32LE(circuit.viewerAcks[0].sequenceNumber, 0)
    const message2 = Buffer.concat([messagePart1, acks])
    circuit.websocket.onmessage({data: message2})

    expect(circuit.viewerAcks.length).toBe(0)
  })
})
