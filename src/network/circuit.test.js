'use strict'

import Circuit from './circuit'

import { createBody, parseBody } from './networkMessages'
import { getValueOf } from './msgGetters'

// Utility for testing
window.WebSocket = class WebSocket {
  constructor (url) {
    this.url = url

    this.sendMessages = []
  }

  send (buffer) {
    this.sendMessages.push(buffer)
    expect(buffer).toBeTruthy()
    if (typeof this.onTestMessage === 'function') {
      this.onTestMessage(buffer)
    }
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
    expect(message).toBeTruthy()
    received.push(message)
  })

  circuit.websocket.onmessage({ data: messageBuffer })

  expect(received.length).toBe(1)
  expect(circuit.senderSequenceNumber).toBe(0)
  circuit.removeAllListeners()
})

test('save sender sequence number of reliable packages as ack', () => {
  const message1 = createTestMessage(true, false, false)
  const message2 = createTestMessage(true, false, false)

  const websocket = circuit.websocket
  websocket.onmessage({ data: message1 })
  websocket.onmessage({ data: message2 })

  expect(circuit.simAcks).toEqual(new Map([
    [sequenceNumberForTests - 2, 0],
    [sequenceNumberForTests - 1, 0]
  ]))
  expect(circuit.simAcksOnPacket.toArray()).toEqual([
    sequenceNumberForTests - 2,
    sequenceNumberForTests - 1
  ])
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
  expect(circuit.simAcks).toEqual(new Map([
    [sequenceNumberForTests - 2, 0],
    [sequenceNumberForTests - 1, 0]
  ]))
  expect(circuit.simAcksOnPacket.isEmpty()).toBe(true)
  expect(last.byteLength).toBe(23)
  expect((last.readUInt8(6) | 0x10) > 0).toBe(true)

  // Check if the acks are correct
  const offset = last.length - 1
  expect(last.readUInt8(offset)).toBe(2)
  expect([last.readUInt32BE(offset - 4), last.readUInt32BE(offset - 8)].sort()).toEqual([
    sequenceNumberForTests - 2,
    sequenceNumberForTests - 1
  ])
})

test('circuit should send after 100ms a PacketAck', () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // could be CompletePingCheck
      const ackMessage1 = circuit.websocket.sendMessages[circuit.websocket.sendMessages.length - 2]
      const ackMessage2 = circuit.websocket.sendMessages[circuit.websocket.sendMessages.length - 1]
      const parsedAckMessageA = parseBody(ackMessage1.slice(12))
      const parsedAckMessageB = parseBody(ackMessage2.slice(12))
      const parsedAckMessage = parsedAckMessageA.name === 'PacketAck'
        ? parsedAckMessageA
        : parsedAckMessageB

      try {
        expect(parsedAckMessage).toBeTruthy()
        expect(getValueOf(parsedAckMessage, 'Packets', 0, 'ID')).toBe(0)

        resolve()
      } catch (err) {
        reject(err)
      }
    }, 100)
  })
})

test('circuit should resend a package after 500ms', () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const last = circuit.websocket.getSendMessages()

      try {
        expect(last.readUInt8(6) | 32).toBeTruthy()

        resolve()
      } catch (err) {
        reject(err)
      }
    }, 400)
  })
})

describe('circuit should remove acks that the server has send back', () => {
  test('with the PacketAck', () => {
    const acksBody = createBody('PacketAck', {
      Packets: circuit.viewerAcks.map(ack => ({ ID: ack.sequenceNumber }))
    })
    const header = createTestHeader(false, false, false)
    const message = Buffer.concat([header, acksBody.buffer])
    circuit.websocket.onmessage({ data: message })

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
    acks.writeUInt32BE(circuit.viewerAcks[0].sequenceNumber, 0)
    const message2 = Buffer.concat([messagePart1, acks])
    circuit.websocket.onmessage({ data: message2 })

    expect(circuit.viewerAcks.length).toBe(0)
  })
})

describe('sending only 255 or less acks at the end of a package', () => {
  let sendAcks = []

  test('circuit only sends less then 256 Acks', () => {
    circuit.simAcks.clear()
    circuit.simAcksOnPacket.clear()

    for (let i = 0; i < 300; ++i) {
      const msg = createTestMessage(true, false, false)
      circuit.websocket.onmessage({ data: msg })
    }

    circuit.send('OpenCircuit', {
      CircuitInfo: [
        {
          IP: '0.0.0.0',
          Port: 13
        }
      ]
    }, true)

    const last = circuit.websocket.getSendMessages()

    expect(last.readUInt8(last.length - 1)).toBe(255)

    for (let offset = last.length - 1, count = last.readUInt8(offset); count > 0; count--) {
      offset -= 4
      sendAcks.push(last.readUInt32BE(offset))
    }
    sendAcks.sort((a, b) => a - b)

    const correctAcks = sendAcks.every((value, index, all) => index === 0
      ? true
      : all[index - 1] + 1 === value
    )
    expect(correctAcks).toBe(true)
  })

  describe('send not-jet-send and the oldest acks by the next package', () => {
    let newAcks = []

    test('send max possible acks', () => {
      circuit.send('OpenCircuit', {
        CircuitInfo: [
          {
            IP: '0.0.0.0',
            Port: 13
          }
        ]
      }, true)

      const last = circuit.websocket.getSendMessages()

      for (let offset = last.length - 1, count = last.readUInt8(offset); count > 0; count--) {
        offset -= 4
        newAcks.push(last.readUInt32BE(offset))
      }

      expect(last.readUInt8(last.length - 1)).toBe(45)
    })

    test('not jet send acks are send', () => {
      const notJetSend = newAcks.filter(ack => !sendAcks.includes(ack)).sort((a, b) => a - b)
      expect(notJetSend.length).toBe(45)

      const correctAcks = notJetSend.every((value, index, all) => index === 0
        ? true
        : all[index - 1] + 1 === value
      )
      expect(correctAcks).toBe(true)
    })

    test('no old Acks are send', () => {
      const oldestAcks = newAcks.filter(ack => sendAcks.includes(ack)).sort((a, b) => a - b)
      expect(oldestAcks.length).toBe(0)
    })
  })
})

test('Acks are send 2 times with the PacketAck message', () => {
  const check = expected => {
    for (const sequenceNumber in circuit.simAcks) {
      const sendCount = circuit.simAcks[sequenceNumber]
      expect(sendCount).toBe(expected)
    }
  }

  check(0)

  const messages = []
  circuit.websocket.onTestMessage = buffer => {
    const msg = parseBody(buffer.slice(12))
    if (msg.name === 'PacketAck') {
      messages.push(msg)

      if (messages.length === 1) {
        check(1)
      }
    }
  }

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        circuit.websocket.onTestMessage = undefined

        expect(messages.length).toBe(2)
        expect(Object.keys(circuit.simAcks).length).toBe(0)

        expect(messages[0].Packets.length).toBe(255)
        expect(messages[1].Packets.length).toBe(255)

        resolve()
      } catch (err) {
        reject(err)
      }
    }, 200)
  })
})

test('circuit closes', () => {
  let websocketClosed = false
  circuit.websocket.close = () => {
    websocketClosed = true
  }

  circuit.close()

  expect(websocketClosed).toBeTruthy()
})
