const assert = require('assert')
const dgram = require('dgram')
const proxyquire = require('proxyquire')
const WebSocket = require('ws')

describe('bridge', function () {
  let testServer
  let testServerPort
  let ws

  let server // express server
  let app    // express app

  beforeEach('setup UDP server', function (done) {
    testServer = dgram.createSocket('udp4')

    testServer.on('message', (msg, rinfo) => {
      testServer.send(msg, 0, msg.length, rinfo.port, rinfo.address)
    })

    testServer.on('listening', () => {
      const address = testServer.address()
      testServerPort = address.port
      done()
    })

    testServer.bind()
  })

  beforeEach('load server', function () {
    const backend = proxyquire('../server/index', {})
    app = backend.app
    server = backend.server
  })

  afterEach('close ws', function () {
    if (ws && (ws.readyState !== WebSocket.CLOSING || ws.readyState !== WebSocket.CLOSED)) {
      ws.close(1000)
    }
  })

  afterEach('close server', function (done) {
    server.close(done)
  })

  afterEach('close UDP server', function (done) {
    testServer.close(done)
  })

  function getBridgeURL () {
    const serverAddress = server.address()
    const url = new URL(
      serverAddress.family === 'IPv6'
        ? `ws://[${serverAddress.address}]`
        : `ws://${serverAddress.address}`
    )
    url.port = serverAddress.port
    url.pathname = '/api/bridge'
    return url
  }

  it('should require a valid grid session', function (done) {
    ws = new WebSocket(getBridgeURL())
    let sendData = []

    ws.on('open', () => {
      ws.send('oisdfg')
    })

    ws.on('close', (code, reason) => {
      try {
        assert.strictEqual(code, 1008, 'Closing code')
        assert.strictEqual(reason, 'wrong session id', 'Closing reason')
        assert.deepStrictEqual(sendData, [], 'no data was send')
        done()
      } catch (err) {
        done(err)
      }
    })

    ws.on('message', data => {
      sendData.push(data)
    })
  })

  it('should send ok when the connection got validated', function (done) {
    const sessionId = app.get('generateSession')()
    const checkSession = app.get('checkSession')
    ws = new WebSocket(getBridgeURL())

    try {
      assert.strictEqual(checkSession(sessionId), 'inactive')
    } catch (err) {
      done(err)
      return
    }

    ws.on('open', () => {
      ws.send(sessionId)
    })

    ws.on('message', data => {
      try {
        assert.strictEqual(data, 'ok')
        const sessionState = checkSession(sessionId)
        assert.strictEqual(sessionState, 'active')

        done()
      } catch (err) {
        done(err)
      }
    })
  })

  it('should proxy messages to a UDP-server', function (done) {
    const sessionId = app.get('generateSession')()
    ws = new WebSocket(getBridgeURL())

    ws.on('open', () => {
      ws.send(sessionId)
    })

    ws.on('message', data => {
      if (typeof data === 'string') {
        const msg = Buffer.concat([
          Buffer.from([127, 0, 0, 1, 0, 0]),
          Buffer.from('test message')
        ])
        msg.writeUInt16LE(testServerPort, 4)
        ws.send(msg)
      } else {
        try {
          assert.strictEqual(data.length, 6 + 12, 'message length')

          // Server address was send along
          assert.deepStrictEqual(
            [
              data.readUInt8(0),
              data.readUInt8(1),
              data.readUInt8(2),
              data.readUInt8(3),
            ],
            [127, 0, 0, 1],
            'IP part was send'
          )
          assert.strictEqual(data.readUInt16LE(4), testServerPort, 'PORT part was send')
          const msg = data.slice(6)
          assert.strictEqual(msg.toString(), 'test message', 'Message body')

          done()
        } catch (err) {
          done(err)
        }
      }
    })
  })

  it('should end the session if the socket was closed', function (done) {
    const sessionId = app.get('generateSession')()
    const checkSession = app.get('checkSession')
    ws = new WebSocket(getBridgeURL())

    ws.on('open', () => {
      ws.send(sessionId)
    })

    ws.on('message', () => {
      ws.close(1000)
    })

    ws.on('close', () => {
      setTimeout(() => {
        try {
          checkSession(sessionId)

          done(new Error('checkSession did not throw!'))
        } catch (err) {
          if (err.message === 'Name or password is incorrect.') {
            done()
          } else {
            done(err)
          }
        }
      }, 15)
    })
  })

  it('should not end the session if the socket was unexpectedly closed', function (done) {
    const sessionId = app.get('generateSession')()
    const checkSession = app.get('checkSession')
    ws = new WebSocket(getBridgeURL())

    ws.on('open', () => {
      ws.send(sessionId)
    })

    ws.on('message', () => {
      ws.terminate()

      setTimeout(() => {
        try {
          const state = checkSession(sessionId)
          assert.strictEqual(state, 'inactive')

          done()
        } catch (err) {
          done(err)
        }
      }, 15)
    })
  })
})
