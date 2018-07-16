'use strict'

const http = require('http')

const fetch = require('node-fetch')

let serverIsRunning = false
let port = 0
let callbacks = []

function createServer () {
  port = Math.floor(Math.random() * 100) + 8080

  const server = http.createServer(function (req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'x-ll-request-id': '2cc76764-d9ec-44f0-8b8e-fa1d5c661e1d'
    })
    res.write('Hello World!')
    res.end()
  })

  server.listen(port, () => {
    serverIsRunning = true
    for (const callback of callbacks) {
      callback(port)
    }
    callbacks = []
  })

  return server
}

const server = createServer()

function registerServerRunCallback (fn) {
  if (serverIsRunning) {
    fn(port)
  } else {
    callbacks.push(fn)
  }
}

test('it should be a function', () => {
  expect(typeof fetch).toBe('function')
})

test('it should get hello world', done => {
  registerServerRunCallback(port => {
    fetch('http://localhost:' + port)
      .then(response => response.buffer())
      .then(buffy => {
        expect(buffy).toEqual(Buffer.from('Hello World!'))
      })
      .catch(err => {
        expect(err).not.toBeInstanceOf(Error)
      })
      .then(() => {
        done()
      })
  })
})

test('it should return the headers', done => {
  registerServerRunCallback(port => {
    fetch('http://localhost:' + port)
      .then(response => {
        expect(response.headers.get('x-ll-request-id'))
          .toBe('2cc76764-d9ec-44f0-8b8e-fa1d5c661e1d')
        expect(response.status).toBe(200)
      })
      .catch(err => {
        expect(err).not.toBeInstanceOf(Error)
      })
      .then(() => {
        done()
      })
  })
})

// should be the last
test('it should fail if server is closed', done => {
  registerServerRunCallback(port => {
    server.close()

    fetch('http://localhost:' + port)
      .catch(err => {
        expect(err).toBeInstanceOf(Error)
        done()
      })
  })
})
