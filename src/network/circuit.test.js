'use strict'

import Circuit from './circuit'

import { createBody, parseBody } from './networkMessages'
import { getValueOf } from './msgGetters'

let circuit

// Utility for testing

window.WebSocket = jest.fn().mockImplementation(() => {
  return {
    send: jest.fn(),
    close: jest.fn(),

    onopen () {},

    onerror () {},

    onclose () {},

    onmessage () {}
  }
})

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

function openSocket () {
  circuit.websocket.onmessage({ data: 'ok' })
}

// Tests

beforeEach(() => {
  if (circuit) {
    circuit.close()
  }
  window.WebSocket.mockClear()
})

test('it should create an instance', () => {
  circuit = new Circuit('127.0.0.1', 8080, 123456, 'session id')

  expect(circuit instanceof Circuit).toBe(true)
  expect(circuit.circuitCode).toBe(123456)
  expect(circuit.ip).toBe('127.0.0.1')
  expect(circuit.ipArray).toEqual([127, 0, 0, 1])
  expect(circuit.port).toBe(8080)
  expect(window.WebSocket).lastCalledWith('ws://localhost/andromeda-bridge')

  expect(circuit.websocketIsOpen).toBe(false)
})

test('circuit closes', () => {
  circuit.close()

  expect(circuit.websocket.close).toBeCalled()
})

test('circuit should send the session id at first', () => {
  circuit = new Circuit('127.0.0.1', 8080, 123456, 'the session id')

  circuit.send('PacketAck', {
    Packets: [
      {
        ID: 0
      }
    ]
  })

  expect(circuit.websocket.send).not.toBeCalled()
  expect(circuit.cachedMessages.length).toBe(1)

  circuit.websocket.onopen()

  expect(circuit.websocket.send).toBeCalledWith('the session id')
  expect(circuit.websocket.send).toBeCalledTimes(1)
  expect(circuit.cachedMessages.length).toBe(1)
})

test('circuit should save messages until the WebSocket is open and send if open', () => {
  circuit = new Circuit('127.0.0.1', 8080, 123456, 'session id')

  circuit.send('PacketAck', {
    Packets: [
      {
        ID: 0
      }
    ]
  })

  expect(circuit.websocket.send).not.toBeCalled()

  circuit.websocket.onopen()

  expect(circuit.websocket.send).toBeCalledWith('session id')

  openSocket()

  expect(circuit.websocketIsOpen).toBe(true)
  expect(circuit.cachedMessages.length).toBe(0)
  expect(circuit.websocket.send).toBeCalledTimes(2)

  circuit.send('PacketAck', {
    Packets: [
      {
        ID: 0
      }
    ]
  })

  expect(circuit.cachedMessages.length).toBe(0)
  expect(circuit.websocket.send).toBeCalledTimes(3)
})

test('parse a received package', () => {
  circuit = new Circuit('127.0.0.1', 8080, 123456, 'session id')

  openSocket()

  const messageBuffer = createTestMessage(false, false, false)

  const handler = jest.fn()
  circuit.on('packetReceived', handler)

  circuit.websocket.onmessage({ data: messageBuffer })

  expect(handler).toBeCalledWith({
    frequency: 'Low',
    from: {
      ip: '127.0.0.1',
      port: 33
    },
    isOld: undefined,
    isReliable: false,
    isResend: false,
    name: 'TestMessage',
    type: 'udp/TestMessage',
    number: 1,
    size: 52,
    trusted: false,
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
    ],
    TestBlock1: [
      {
        Test1: 0
      }
    ],
    blocks: [
      [
        {
          Test1: 0
        }
      ],
      [
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
    ]
  })
  expect(circuit.senderSequenceNumber).toBe(0)
  circuit.removeAllListeners()
})

test('save sender sequence number of reliable packages as ack', () => {
  circuit = new Circuit('127.0.0.1', 8080, 123456, 'session id')

  openSocket()

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
  circuit = new Circuit('127.0.0.1', 8080, 123456, 'session id')

  openSocket()

  const websocket = circuit.websocket
  websocket.onmessage({ data: createTestMessage(true, false, false) })
  websocket.onmessage({ data: createTestMessage(true, false, false) })

  circuit.send('CompletePingCheck', {
    PingID: [
      {
        PingID: 0
      }
    ]
  })

  const last = circuit.websocket.send.mock.calls[0][0]

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

test('circuit should send after 100ms a PacketAck', async () => {
  circuit = new Circuit('127.0.0.1', 8080, 123456, 'session id')

  openSocket()

  const websocket = circuit.websocket
  websocket.onmessage({ data: createTestMessage(true, false, false) })
  websocket.onmessage({ data: createTestMessage(true, false, false) })

  await new Promise((resolve) => setTimeout(resolve, 210))

  for (const [pack] of circuit.websocket.send.mock.calls) {
    const msg = parseBody(pack.slice(12))

    switch (msg.name) {
      case 'PacketAck':
        expect(getValueOf(msg, 'Packets', 0, 'ID')).toBeGreaterThanOrEqual(0)
        continue

      case 'StartPingCheck':
        expect(getValueOf(msg, 'PingID', 0, 'PingID')).toBe(0)
        continue

      default:
        expect(msg.name).toBeUndefined()
        continue
    }
  }
})

test('circuit should resend a package after 500ms', async () => {
  circuit = new Circuit('127.0.0.1', 8080, 123456, 'session id')

  openSocket()

  circuit.send('CompletePingCheck', {
    PingID: [
      {
        PingID: 0
      }
    ]
  }, true)

  await new Promise(resolve => setTimeout(resolve, 575))

  const completePingChecks = circuit.websocket.send.mock.calls
    .map(([pack]) => parseBody(pack.slice(12)))
    .filter(msg => msg.name === 'CompletePingCheck')

  expect(completePingChecks.length).toBe(2)
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
  const sendAcks = []

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
    const newAcks = []

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

describe('circuit returns a Promise by reliable packages', () => {
  let reliablePackage = null

  test('circuit returns a Promise by reliable packages', () => {
    circuit.simAcks.clear()
    circuit.simAcksOnPacket.clear()
    circuit.viewerAcks = []

    const result = circuit.send('OpenCircuit', {
      CircuitInfo: [
        {
          IP: '0.0.0.0',
          Port: 13
        }
      ]
    }, true)

    expect(result).toBeInstanceOf(Promise)

    reliablePackage = result
  })

  test('Promise resolves if ack is received', () => {
    const sequenceNumber = circuit.viewerAcks[0].sequenceNumber

    const acksBody = createBody('PacketAck', {
      Packets: [
        { ID: sequenceNumber }
      ]
    })
    const header = createTestHeader(false, false, false)
    const message = Buffer.concat([header, acksBody.buffer])

    setTimeout(() => {
      circuit.websocket.onmessage({ data: message })
    }, 50)

    expect(reliablePackage).toBeTruthy()
    return reliablePackage
  })

  test('Promise rejects after sending it Package 4 times', async () => {
    let error = null

    try {
      await circuit.send('OpenCircuit', {
        CircuitInfo: [
          {
            IP: '0.0.0.0',
            Port: 13
          }
        ]
      }, true)
    } catch (err) {
      error = err
    }

    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('Server did timeout')
  })

  test('Promise also resolves if the Packet was resend', () => {
    let messageWasAlreadySend = false
    circuit.websocket.onTestMessage = buffer => {
      if (messageWasAlreadySend && circuit.viewerAcks.length > 0) {
        const sequenceNumber = circuit.viewerAcks[0].sequenceNumber

        const acksBody = createBody('PacketAck', {
          Packets: [
            { ID: sequenceNumber }
          ]
        })
        const header = createTestHeader(false, false, false)
        const message = Buffer.concat([header, acksBody.buffer])

        circuit.websocket.onmessage({ data: message })
      } else {
        messageWasAlreadySend = true
      }
    }

    const result = circuit.send('OpenCircuit', {
      CircuitInfo: [
        {
          IP: '0.0.0.0',
          Port: 13
        }
      ]
    }, true)
    expect(result).toBeInstanceOf(Promise)
    return result
  })
})
