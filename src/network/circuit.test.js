import ms from 'milliseconds'

import Circuit from './circuit'

import { createBody, parseBody } from './networkMessages'
import { getValueOf } from './msgGetters'

let circuit

// Utility for testing

beforeEach(() => {
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
  jest.useFakeTimers()
  circuit = null
  window.WebSocket.mockClear()
})

afterEach(() => {
  if (circuit.viewerAcks.length > 0) {
    circuit.viewerAcks = []
  }

  circuit.close()
})

test('it should create an instance', () => {
  circuit = new Circuit('127.0.0.1', 8080, 123456, 'session id')

  expect(circuit instanceof Circuit).toBe(true)
  expect(circuit.circuitCode).toBe(123456)
  expect(circuit.ip).toBe('127.0.0.1')
  expect(circuit.ipArray).toEqual([127, 0, 0, 1])
  expect(circuit.port).toBe(8080)
  expect(window.WebSocket).lastCalledWith('ws://localhost/api/bridge')

  expect(circuit.websocketIsOpen).toBe(false)
})

test('circuit closes', () => {
  circuit = new Circuit('127.0.0.1', 8080, 123456, 'session id')

  const removeAllListeners = circuit.removeAllListeners
  circuit.removeAllListeners = jest.fn(() => {
    removeAllListeners.call(circuit)
  })

  circuit.close()

  expect(clearInterval).toBeCalled()
  expect(circuit.removeAllListeners).toBeCalled()
  expect(circuit.websocket.close).toBeCalled()
  expect(circuit.websocket.close).lastCalledWith(1000, 'session end')
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

test('circuit should send after 100ms a PacketAck', () => {
  circuit = new Circuit('127.0.0.1', 8080, 123456, 'session id')

  openSocket()

  const websocket = circuit.websocket
  websocket.onmessage({ data: createTestMessage(true, false, false) })
  websocket.onmessage({ data: createTestMessage(true, false, false) })

  jest.advanceTimersByTime(200)

  expect(setTimeout).toHaveBeenCalledTimes(1)
  expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100)
  expect(setInterval).toHaveBeenLastCalledWith(expect.any(Function), 100)

  let packageAck
  let startPingCheck

  for (const [pack] of circuit.websocket.send.mock.calls) {
    const msg = parseBody(pack.slice(12))

    switch (msg.name) {
      case 'PacketAck':
        packageAck = msg
        continue

      case 'StartPingCheck':
        startPingCheck = msg
        continue
        
      default:
        continue
      }
    }

    expect(getValueOf(packageAck, 'Packets', 0, 'ID')).toBeGreaterThanOrEqual(0)
    expect(getValueOf(startPingCheck, 'PingID', 0, 'PingID')).toBe(0)
})

test('circuit should resend a package after 500ms', () => {
  circuit = new Circuit('127.0.0.1', 8080, 123456, 'session id')

  openSocket()

  jest.runOnlyPendingTimers()
  const sendTime = Date.now()

  circuit.send('CompletePingCheck', {
    PingID: [
      {
        PingID: 0
      }
    ]
  }, true)

  expect(circuit.viewerAcks.length).toBe(1)
  expect(circuit.viewerAcks[0].time).toBeGreaterThanOrEqual(sendTime)

  circuit.viewerAcks[0].time = Date.now() - 501

  jest.runOnlyPendingTimers()

  const completePingChecks = circuit.websocket.send.mock.calls
    .map(([pack]) => parseBody(pack.slice(12)))
    .filter(msg => msg.name === 'CompletePingCheck')

  expect(completePingChecks.length).toBe(2)
})

test('Acks are send 2 times with the PacketAck message', () => {
  circuit = new Circuit('127.0.0.1', 8080, 123456, 'session id')

  openSocket()

  circuit.websocket.onmessage({ data: createTestMessage(true, false, false) })

  const check = expected => {
    for (const sequenceNumber in circuit.simAcks) {
      const sendCount = circuit.simAcks[sequenceNumber]
      expect(sendCount).toBe(expected)
    }
  }

  check(0)

  for (let i = 0; i < 3; ++i) {
    jest.runOnlyPendingTimers()
    circuit.websocket.onmessage({ data: createTestMessage() })
  }

  const acks = circuit.websocket.send.mock.calls
    .map(([msg]) => parseBody(msg.slice(12)).Packets)
    .filter(p => p != null)
  expect(acks.length).toBe(2)
  expect(acks[0][0].ID).toBeGreaterThanOrEqual(0)
  expect(acks[1][0].ID).toBeGreaterThanOrEqual(0)
  expect(acks[0][0].ID).toBe(acks[1][0].ID)
})

describe('circuit should remove acks that the server has send back', () => {
  test('with the PacketAck', () => {
    circuit = new Circuit('127.0.0.1', 8080, 123456, 'session id')
    openSocket()

    circuit.send('OpenCircuit', {
      CircuitInfo: [
        {
          IP: '0.0.0.0',
          Port: 13
        }
      ]
    }, true)
    circuit.send('OpenCircuit', {
      CircuitInfo: [
        {
          IP: '0.0.0.0',
          Port: 13
        }
      ]
    }, true)

    expect(circuit.viewerAcks.length).toBe(2)

    const acksBody = createBody('PacketAck', {
      Packets: circuit.viewerAcks.map(ack => ({ ID: ack.sequenceNumber }))
    })
    const header = createTestHeader(false, false, false)
    const message = Buffer.concat([header, acksBody.buffer])
    circuit.websocket.onmessage({ data: message })

    expect(circuit.viewerAcks.length).toBe(0)
  })

  test('with acks at the end of a packet', () => {
    circuit = new Circuit('127.0.0.1', 8080, 123456, 'session id')
    openSocket()

    circuit.send('OpenCircuit', {
      CircuitInfo: [
        {
          IP: '0.0.0.0',
          Port: 13
        }
      ]
    }, true)
    circuit.send('OpenCircuit', {
      CircuitInfo: [
        {
          IP: '0.0.0.0',
          Port: 13
        }
      ]
    }, true)

    expect(circuit.viewerAcks.length).toBe(2)

    // test at the end of packet
    const messagePart1 = createTestMessage(false, false, true)

    // create Ack at end
    const acks = Buffer.alloc((circuit.viewerAcks.length * 4) + 1)
    acks.writeUInt32BE(circuit.viewerAcks[0].sequenceNumber, 0)
    acks.writeUInt32BE(circuit.viewerAcks[1].sequenceNumber, 4)
    acks.writeUInt8(circuit.viewerAcks.length, acks.length - 1)
    const message2 = Buffer.concat([messagePart1, acks])
    circuit.websocket.onmessage({ data: message2 })

    expect(circuit.viewerAcks.length).toBe(0)
  })
})

describe('sending only 255 or less acks at the end of a package', () => {
  test('circuit only sends less then 256 Acks', () => {
    circuit = new Circuit('127.0.0.1', 8080, 123456, 'session id')
    openSocket()

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

    const last = circuit.websocket.send.mock.calls[circuit.websocket.send.mock.calls.length - 1][0]

    expect(last.readUInt8(last.length - 1)).toBe(255)

    const sendAcks = []
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

  describe('send not-yet-send and the oldest acks by the next package', () => {
    test('send max possible acks', () => {
      circuit = new Circuit('127.0.0.1', 8080, 123456, 'session id')
      openSocket()

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

      circuit.send('OpenCircuit', {
        CircuitInfo: [
          {
            IP: '0.0.0.0',
            Port: 13
          }
        ]
      }, true)

      const last = circuit.websocket.send.mock.calls[
        circuit.websocket.send.mock.calls.length - 1
      ][0]

      expect(last.readUInt8(last.length - 1)).toBe(45)
    })

    test('not yet send acks are send', () => {
      circuit = new Circuit('127.0.0.1', 8080, 123456, 'session id')
      openSocket()

      const acks = new Set()

      const send = jest.fn(msg => {
        for (let offset = msg.length - 1, count = msg.readUInt8(offset); count > 0; count--) {
          offset -= 4
          acks.add(msg.readUInt32BE(offset))
        }
      })
      circuit.websocket.send = send

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

      const acksCount = acks.size

      circuit.send('OpenCircuit', {
        CircuitInfo: [
          {
            IP: '0.0.0.0',
            Port: 13
          }
        ]
      }, true)

      expect(acks.size).toBe(acksCount + 45)
    })
  })
})

describe('circuit returns a Promise by reliable packages', () => {
  test('Promise resolves if ack is received', () => {
    circuit = new Circuit('127.0.0.1', 8080, 123456, 'session id')
    openSocket()

    const result = circuit.send('OpenCircuit', {
      CircuitInfo: [
        {
          IP: '0.0.0.0',
          Port: 13
        }
      ]
    }, true)

    const sequenceNumber = circuit.viewerAcks[0].sequenceNumber

    const acksBody = createBody('PacketAck', {
      Packets: [
        { ID: sequenceNumber }
      ]
    })
    const header = createTestHeader(false, false, false)
    const message = Buffer.concat([header, acksBody.buffer])

    circuit.websocket.onmessage({ data: message })

    expect(result).toBeInstanceOf(Promise)
    return expect(result).resolves.toBeUndefined()
  })

  test('Promise also resolves if the Packet was resend', () => {
    circuit = new Circuit('127.0.0.1', 8080, 123456, 'session id')
    openSocket()

    jest.runOnlyPendingTimers()

    let messageWasAlreadySend = false
    circuit.websocket.send = buffer => {
      if (messageWasAlreadySend) {
        const sequenceNumber = buffer.readUInt32BE(7)

        const acksBody = createBody('PacketAck', {
          Packets: [
            { ID: sequenceNumber }
          ]
        })
        const header = createTestHeader(false, false, false)
        const message = Buffer.concat([header, acksBody.buffer])

        setTimeout(() => {
          circuit.websocket.onmessage({ data: message })
        }, 0)
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

    expect(circuit.viewerAcks.length).toBe(1)
    circuit.viewerAcks[0].time = Date.now() - 501

    jest.runOnlyPendingTimers()
    jest.runOnlyPendingTimers() // for the setTimeout in circuit.websocket.send mock

    return expect(result).resolves.toBeUndefined()
  })

  test('Promise rejects after sending it Package 4 times', () => {
    circuit = new Circuit('127.0.0.1', 8080, 123456, 'session id')
    openSocket()

    jest.runOnlyPendingTimers()

    circuit.websocket.send = buffer => {
      const body = parseBody(buffer.slice(12))

      if (body.name !== 'SimulatorMapUpdate') {
        const socket = circuit.websocket
        setTimeout(() => {
          const sequenceNumber = buffer.readUInt32BE(7)

          const acksBody = createBody('PacketAck', {
            Packets: [
              { ID: sequenceNumber }
            ]
          })
          const header = createTestHeader(true, false, false)
          const message = Buffer.concat([header, acksBody.buffer])

          socket.onmessage({ data: message })
        }, 0)
      }
    }

    const result = circuit.send('SimulatorMapUpdate', {
      MapData: [
        {
          Flags: 13
        }
      ]
    }, true)

    for (let i = 0; i < 4; ++i) {
      expect(circuit.viewerAcks.length).toBe(1)
      expect(circuit.viewerAcks[0].resentCount).toBe(i)
      circuit.viewerAcks[0].time = Date.now() - 501

      jest.runOnlyPendingTimers()
    }

    return expect(result).rejects.toThrowError(new Error('Server did timeout'))
  })
})

describe('disconnection', () => {
  test('it tries to reconnect when a websocket is disconnected', () => {
    circuit = new Circuit('127.0.0.1', 8080, 123456, 'session id')
    openSocket()

    expect(window.WebSocket).toBeCalledTimes(1)
    jest.clearAllTimers()

    circuit.websocket.onclose(new window.CloseEvent('Abnormal Closure', {
      wasClean: false,
      code: 1006,
      reason: ''
    }))

    expect(setTimeout).toHaveBeenCalledTimes(2)
    expect(setTimeout.mock.calls[1]).toEqual([
      expect.any(Function),
      100
    ])

    jest.runOnlyPendingTimers()

    expect(circuit.reconnectCount).toBe(1)
    expect(window.WebSocket).toBeCalledTimes(2)
  })

  test("it shouldn't reconnect when the bridge did disconnect for a wrong session ID", () => {
    circuit = new Circuit('127.0.0.1', 8080, 123456, 'session id')
    openSocket()

    expect(window.WebSocket).toBeCalledTimes(1)
    setTimeout.mockReset()

    const closeEvent = jest.fn()
    circuit.on('close', closeEvent)

    circuit.websocket.onclose(new window.CloseEvent('Policy Violation', {
      wasClean: true,
      code: 1008,
      reason: 'wrong session id'
    }))

    expect(setTimeout).not.toHaveBeenCalled()

    expect(window.WebSocket).toBeCalledTimes(1)
    expect(closeEvent).toBeCalled()
    expect(closeEvent).toHaveBeenLastCalledWith({
      code: 1008,
      reason: 'wrong session id'
    })
  })

  test('it should exponentially increase the reconnect timeout', () => {
    circuit = new Circuit('127.0.0.1', 8080, 123456, 'session id')
    openSocket()

    expect(window.WebSocket).toBeCalledTimes(1)
    jest.clearAllTimers()

    for (let i = 0; i < 5; ++i) {
      circuit.websocket.onclose(new window.CloseEvent('Abnormal Closure', {
        wasClean: false,
        code: 1006,
        reason: 'disconnect'
      }))
      jest.runAllTimers()
    }

    expect(window.WebSocket).toHaveBeenCalledTimes(6)
    expect(setTimeout).toHaveBeenCalledTimes(6)
    expect(setTimeout.mock.calls).toEqual([
      [expect.any(Function), 100], // from _startAcksProcess
      [expect.any(Function), 100],
      [expect.any(Function), 200],
      [expect.any(Function), 400],
      [expect.any(Function), 800],
      [expect.any(Function), 1600]
    ])
  })

  test('it should timeout after 10 retries', () => {
    circuit = new Circuit('127.0.0.1', 8080, 123456, 'session id')
    openSocket()

    const closeEvent = jest.fn()
    circuit.on('close', closeEvent)

    expect(window.WebSocket).toBeCalledTimes(1)
    jest.clearAllTimers()
    const reconnectCounts = []

    for (let i = 0; i <= 11; ++i) {
      circuit.websocket.onclose(new window.CloseEvent('Abnormal Closure', {
        wasClean: false,
        code: 1006,
        reason: 'disconnect'
      }))
      jest.runAllTimers()

      reconnectCounts.push(circuit.reconnectCount)
    }

    expect(reconnectCounts).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 11])
    expect(window.WebSocket).toHaveBeenCalledTimes(12)
    expect(closeEvent).toHaveBeenCalledWith({
      code: 1006,
      reason: 'Max reconnection tries'
    })
  })

  // This is for developing and if there will be a direct UDP connection in the future
  test('it should disconnect after a timeout of not receiving any messages', () => {
    circuit = new Circuit('127.0.0.1', 8080, 123456, 'session id')
    openSocket()

    jest.runOnlyPendingTimers()

    const closeHandler = jest.fn()
    circuit.on('close', closeHandler)

    jest.runTimersToTime(ms.minutes(1) + ms.seconds(45) + 150)

    expect(closeHandler).toHaveBeenCalledWith({
      code: 1006,
      reason: 'UDP disconnect'
    })
  })
})
