import http from 'http'

import WebSocket from 'ws'

test('it should have a Server', () => {
  expect(typeof WebSocket.Server).toBe('function')
})

test('it should have the capability to listen on a existing server', () => {
  const server = http.createServer()

  const wsServer = new WebSocket.Server({
    server: server,
    perMessageDeflate: false,
    path: '/andromeda-bridge'
  })

  expect(wsServer).toBeTruthy()
})

describe('communication', () => {
  const server = http.createServer()

  const wsServer = new WebSocket.Server({
    server: server,
    perMessageDeflate: false,
    path: '/andromeda-bridge'
  })
  wsServer.on('error', error => {
    expect(error).not.toBeTruthy()
  })

  let port = 0
  let serverSocket = null
  let client = null

  test('it should start listen', () => {
    return new Promise((resolve, reject) => {
      server.listen(0, '127.0.0.1', () => {
        port = server.address().port

        try {
          expect(port).not.toBe(0)
          resolve()
        } catch (err) {
          reject(err)
        }
      })
    })
  })

  test('it should create a socket if a connection is started', () => {
    return new Promise((resolve, reject) => {
      wsServer.on('connection', ws => {
        if (serverSocket != null) {
          serverSocket.close()
        }
        serverSocket = ws

        try {
          expect(serverSocket).toBeTruthy()
          resolve()
        } catch (err) {
          reject(err)
        }
      })

      try {
        client = new WebSocket(`ws://127.0.0.1:${port}/andromeda-bridge`)
      } catch (err) {
        reject(err)
      }
    })
  })

  test('it should receive binary data', () => {
    return new Promise((resolve, reject) => {
      serverSocket.on('message', msg => {
        try {
          expect(msg).toBeInstanceOf(Buffer)
          expect(msg).toEqual(Buffer.from([1, 2, 3, 4, 5, 6]))
          resolve()
        } catch (err) {
          reject(err)
        }
      })

      const sendFn = () => {
        client.send(Buffer.from([1, 2, 3, 4, 5, 6]))
      }

      if (client.readyState === 1) {
        sendFn()
      } else {
        client.on('open', () => {
          sendFn()
        })
      }
    })
  })

  test('it should be able to send data to the client', () => {
    return new Promise((resolve, reject) => {
      client.on('message', msg => {
        try {
          expect(msg).toBeInstanceOf(Buffer)
          expect(msg).toEqual(Buffer.from([1, 2, 3, 4, 5, 6]))
          resolve()
        } catch (err) {
          reject(err)
        }
      })

      serverSocket.send(Buffer.from([1, 2, 3, 4, 5, 6]))
    })
  })

  test('it should close all connections if the webSocket Server closes', done => {
    client.on('close', () => {
      done()
    })

    server.close()
    wsServer.close()
  })
})
