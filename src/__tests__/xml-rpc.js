'use strict'

const http = require('http')

const xmlrpc = require('xmlrpc')

let serverIsRunning = false
const port = Math.floor(Math.random() * 100) + 8080
let lastBody = ''

const server = http.createServer((req, res) => {
  let data = ''

  const headers = req.headers
  headers['content-type'] = 'text/xml'
  headers.url = req.url
  res.writeHead(200, headers)

  req.on('data', chunk => {
    data += chunk.toString()
  })
  req.on('end', () => {
    lastBody = data
    res.writeHead(200)
    res.write('<?xml version="1.0"?><methodResponse><params><param><value><struct>' +
      '<member><name>first-name</name><value><string>tester</string></value></member>' +
      '<member><name>last-name</name><value><string>name</string></value></member>' +
      '<member><name>options</name><value><array><data>' +
        '<value><string>a</string></value>' +
        '<value><string>b</string></value>' +
      '</data></array></value></member>' +
      '<member><name>working</name><value><boolean>1</boolean></value></member>' +
      '<member><name>number</name><value><double>1234.5</double></value></member>' +
      '</struct></param></params></methodResponse>')
    res.end()
  })
})
server.listen(port, () => {
  serverIsRunning = true
})

test('it should have methods for creating a secure or a not secure client', () => {
  expect(typeof xmlrpc.createClient).toBe('function')
  expect(xmlrpc.createClient.length).toBe(1)

  expect(typeof xmlrpc.createSecureClient).toBe('function')
  expect(xmlrpc.createSecureClient.length).toBe(1)
})

test('it should require host, port and path', () => {
  const secureClient = xmlrpc.createSecureClient({
    host: 'login.agni.lindenlab.com',
    port: 443,
    path: '/cgi-bin/login.cgi'
  })

  expect(secureClient).toBeTruthy()
  expect(typeof secureClient.methodCall).toBe('function')
  expect(secureClient.methodCall.length).toBe(3)
  expect(secureClient.options.host).toBe('login.agni.lindenlab.com')
  expect(secureClient.options.port).toBe(443)
  expect(secureClient.options.path).toBe('/cgi-bin/login.cgi')
  expect(secureClient.isSecure).toBe(true)

  const client = xmlrpc.createClient({
    host: 'login.agni.lindenlab.com',
    port: 443,
    path: '/cgi-bin/login.cgi'
  })

  expect(client).toBeTruthy()
  expect(typeof client.methodCall).toBe('function')
  expect(client.methodCall.length).toBe(3)
  expect(client.options.host).toBe('login.agni.lindenlab.com')
  expect(client.options.port).toBe(443)
  expect(client.options.path).toBe('/cgi-bin/login.cgi')
  expect(client.isSecure).toBe(false)

  // if you let some info out
  expect(xmlrpc.createClient({
    host: 'login.agni.lindenlab.com',
    path: '/cgi-bin/login.cgi'
  }).options.port).toBeUndefined()

  expect(xmlrpc.createClient({
    host: 'login.agni.lindenlab.com',
    port: 443
  }).options.path).toBeUndefined()

  expect(xmlrpc.createClient({
    port: 443,
    path: '/cgi-bin/login.cgi'
  }).options.host).toBeUndefined()
})

test('it should make a XML-RPC-request to a http-server', () => {
  const client = xmlrpc.createClient({
    host: 'localhost',
    port: port,
    path: '/testPath'
  })

  return new Promise((resolve, reject) => {
    const params = [
      {
        'first-name': 'tester',
        'last-name': 'name',
        options: [
          'a',
          'b'
        ],
        working: true,
        number: 1234.5
      }
    ]

    const makeCall = () => {
      client.methodCall('login_to_simulator', params, (err, value) => {
        if (err) {
          reject(err)
          return
        }

        server.close()

        try {
          expect(lastBody.replace('\n', '')).toBe('<?xml version="1.0"?>' +
            '<methodCall><methodName>login_to_simulator</methodName>' +
            '<params><param><value><struct>' +
            '<member><name>first-name</name><value><string>tester</string></value></member>' +
            '<member><name>last-name</name><value><string>name</string></value></member>' +
            '<member><name>options</name><value><array><data>' +
              '<value><string>a</string></value>' +
              '<value><string>b</string></value>' +
            '</data></array></value></member>' +
            '<member><name>working</name><value><boolean>1</boolean></value></member>' +
            '<member><name>number</name><value><double>1234.5</double></value></member>' +
            '</struct></value></param></params></methodCall>')
          expect(value).toEqual(params[0])
          resolve()
        } catch (err2) {
          reject(err2)
        }
      })
    }

    if (serverIsRunning) {
      makeCall()
    } else {
      setTimeout(makeCall, 2)
    }
  })
})
