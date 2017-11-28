'use strict'

import Circuit from './circuit'

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

  circuit.websocket.sendMessages = []
})
