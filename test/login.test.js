'use strict'

const assert = require('assert')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const request = require('supertest')

describe('login', function () {
  let clock
  let app
  let server // express server
  let usersDbCreateIndex
  let usersDbGet
  let usersDbInsert
  let xmlRpcCreateClient
  let fetch

  beforeEach('fake timers', function () {
    clock = sinon.useFakeTimers(Date.now())
  })

  beforeEach('load server', function () {
    usersDbCreateIndex = sinon.stub()
    usersDbGet = sinon.stub()
    usersDbInsert = sinon.stub()
    xmlRpcCreateClient = sinon.stub()
    fetch = sinon.stub()
    fetch['@global'] = true

    usersDbCreateIndex.resolves()

    const backend = proxyquire('../server/index', {
      './db': {
        '@global': true,
        usersDB: {
          createIndex: usersDbCreateIndex,
          get: usersDbGet,
          insert: usersDbInsert
        }
      },
      xmlrpc: {
        '@global': true,
        createClient: xmlRpcCreateClient,
        createSecureClient: xmlRpcCreateClient
      },
      'node-fetch': fetch
    })
    app = backend.app
    server = backend.server
  })

  afterEach('close server', function (done) {
    server.close(done)
  })

  afterEach('restore timers', function () {
    clock.restore()
  })

  describe('XML-RPC', function () {
    const data = {
      first: 'Tester',
      last: 'MacTester',
      passwd: 'geheim',
      start: 'last',
      channel: 'andromeda-viewer',
      version: '2020.09.01.1010',
      platform: 'Mac',
      platform_version: '70.0',
      last_exec_event: 0,
      options: [
        'buddy-list',
        'inventory-root',
        'inventory-skeleton'
      ],
      agree_to_tos: 'true',
      read_critical: 'true'
    }
    let methodCall

    beforeEach(function () {
      methodCall = sinon.stub()
      xmlRpcCreateClient.returns({ methodCall })
    })

    describe('anonym', function () {
      it('should handle logins without an URL', function (done) {
        methodCall.callsFake(function request (_name, _data, cb) {
          cb(null, {
            login: 'true',
            first: 'First Name',
            last: 'Last Name',
            otherData: 'moar'
          })
        })

        request(server)
          .post('/api/login')
          .set('Content-Type', 'application/json')
          .set('x-andromeda-login-content-type', 'xml-rpc')
          .send(data)
          .expect(
            'x-andromeda-session-id',
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          )
          .expect(res => {
            // adds the session Id to the session store
            const checkSession = app.get('checkSession')
            assert.strictEqual(
              checkSession(res.headers['x-andromeda-session-id']),
              'inactive'
            )
          })
          .expect(200, {
            login: 'true',
            first: 'First Name',
            last: 'Last Name',
            otherData: 'moar'
          })
          .end(err => {
            try {
              if (err) throw err

              assert.strictEqual(
                xmlRpcCreateClient.firstCall.firstArg.href,
                'https://login.agni.lindenlab.com/cgi-bin/login.cgi'
              )
              assert.strictEqual(methodCall.firstCall.firstArg, 'login_to_simulator')
              assert.deepStrictEqual(methodCall.firstCall.args[1], [
                {
                  agree_to_tos: 'true',
                  channel: 'andromeda-viewer',
                  first: 'Tester',
                  id0: '00:00:NaN:00:00:01',
                  last: 'MacTester',
                  last_exec_event: 0,
                  mac: '00:00:NaN:00:00:01',
                  options: [
                    'buddy-list',
                    'inventory-root',
                    'inventory-skeleton'
                  ],
                  passwd: 'geheim',
                  platform: 'Mac',
                  platform_version: '70.0',
                  read_critical: 'true',
                  start: 'last',
                  version: '2020.09.01.1010'
                }
              ])
              done()
            } catch (err) {
              done(err)
            }
          })
      })

      it('should handle logins with an URL', function (done) {
        methodCall.callsFake(function request (_name, _data, cb) {
          cb(null, {
            login: 'true',
            first: 'First Name',
            last: 'Last Name',
            otherData: 'moar'
          })
        })

        const loginURL = 'http://login.osgrid.org/'

        request(server)
          .post('/api/login')
          .set('Content-Type', 'application/json')
          .set('x-andromeda-login-content-type', 'xml-rpc')
          .set('x-andromeda-login-url', loginURL)
          .send(data)
          .expect(
            'x-andromeda-session-id',
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          )
          .expect(res => {
            // adds the session Id to the session store
            const checkSession = app.get('checkSession')
            assert.strictEqual(
              checkSession(res.headers['x-andromeda-session-id']),
              'inactive'
            )
          })
          .expect(function () {
            assert.strictEqual(xmlRpcCreateClient.firstCall.firstArg.href, loginURL)
          })
          .expect(200, {
            login: 'true',
            first: 'First Name',
            last: 'Last Name',
            otherData: 'moar'
          }, done)
      })

      it('should return 401 if the login did fail', function (done) {
        methodCall.callsFake(function request (_name, _data, cb) {
          cb(null, {
            name: 'Login failed',
            message: 'Your login was false'
          })
        })

        request(server)
          .post('/api/login')
          .set('Content-Type', 'application/json')
          .set('x-andromeda-login-content-type', 'xml-rpc')
          .send(data)
          .expect(function (res) {
            assert.strictEqual(res.headers['x-andromeda-session-id'], undefined)
          })
          .expect(401, {
            name: 'Login failed',
            message: 'Your login was false'
          }, done)
      })

      it('should validate the request', function (done) {
        request(server)
          .post('/api/login')
          .set('Content-Type', 'application/json')
          .set('x-andromeda-login-content-type', 'xml-rpc')
          .send({
            ...data,
            last: undefined
          })
          .expect(function (res) {
            assert.strictEqual(res.headers['x-andromeda-session-id'], undefined)
          })
          .expect(400, {}, done)
      })

      it('should handle errors from XML-RPC', function (done) {
        methodCall.callsFake(function request (_name, _data, cb) {
          cb(new Error('test'))
        })

        request(server)
          .post('/api/login')
          .set('Content-Type', 'application/json')
          .set('x-andromeda-login-content-type', 'xml-rpc')
          .send(data)
          .expect(500)
          .expect(function (res) {
            assert.strictEqual(res.headers['x-andromeda-session-id'], undefined)
            assert.strictEqual(res.body.message, 'test')
          })
          .end(done)
      })
    })

    describe('with logged in user', function () {
      const userId = '3989c4e7-e7ed-48a2-9f2a-a40e520ecd32'
      const userDoc = {
        _id: 'org.couchdb.user:3989c4e7-e7ed-48a2-9f2a-a40e520ecd32',
        _rev: '1-f0b0682c4700a3cbee99f6ed8cbee95c',
        type: 'user',
        name: '3989c4e7-e7ed-48a2-9f2a-a40e520ecd32',
        password_scheme: 'pbkdf2',
        derived_key: 'oisdfngioenf[gonweijfgnkjerngenfgienr',
        salt: 'idgijnepfgnerfngpo',
        roles: [],
        email: 'tester.mactestface@example.com'
      }
      const userDocWithMac = {
        ...userDoc,
        mac: 'db:35:c3:48:d8:4b'
      }

      it("should create a fake MAC-Address if the user doesn't have one", function (done) {
        methodCall.callsFake(function request (_name, _data, cb) {
          cb(null, {
            login: 'true',
            first: 'First Name',
            last: 'Last Name',
            otherData: 'moar'
          })
        })

        usersDbGet.resolves(userDoc)
        usersDbInsert.resolves()

        request(server)
          .post('/api/login')
          .set('Content-Type', 'application/json')
          .set('x-andromeda-login-content-type', 'xml-rpc')
          .set('x-andromeda-login-user-id', userId)
          .send(data)
          .expect(
            'x-andromeda-session-id',
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          )
          .expect(res => {
            // adds the session Id to the session store
            const checkSession = app.get('checkSession')
            assert.strictEqual(
              checkSession(res.headers['x-andromeda-session-id']),
              'inactive'
            )
          })
          .expect(function () {
            assert.strictEqual(
              usersDbGet.firstCall.firstArg,
              'org.couchdb.user:3989c4e7-e7ed-48a2-9f2a-a40e520ecd32'
            )
            assert.ok(
              /(?:[a-fA-F\d]{1,2}:){5}[a-fA-F\d]{1,2}/i.test(usersDbInsert.firstCall.firstArg.mac)
            )
          })
          .expect(200, {
            login: 'true',
            first: 'First Name',
            last: 'Last Name',
            otherData: 'moar'
          }, done)
      })

      it('should use the existing fake MAC-Address', function (done) {
        methodCall.callsFake(function request (_name, _data, cb) {
          cb(null, {
            login: 'true',
            first: 'First Name',
            last: 'Last Name',
            otherData: 'moar'
          })
        })

        usersDbGet.resolves(userDocWithMac)
        usersDbInsert.resolves()

        request(server)
          .post('/api/login')
          .set('Content-Type', 'application/json')
          .set('x-andromeda-login-content-type', 'xml-rpc')
          .set('x-andromeda-login-user-id', userId)
          .send(data)
          .expect(
            'x-andromeda-session-id',
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          )
          .expect(res => {
            // adds the session Id to the session store
            const checkSession = app.get('checkSession')
            assert.strictEqual(
              checkSession(res.headers['x-andromeda-session-id']),
              'inactive'
            )
          })
          .expect(function () {
            assert.deepStrictEqual(methodCall.firstCall.args[1], [
              {
                id0: 'db:35:c3:48:d8:4b',
                mac: 'db:35:c3:48:d8:4b',
                agree_to_tos: 'true',
                channel: 'andromeda-viewer',
                first: 'Tester',
                last: 'MacTester',
                last_exec_event: 0,
                options: [
                  'buddy-list',
                  'inventory-root',
                  'inventory-skeleton'
                ],
                passwd: 'geheim',
                platform: 'Mac',
                platform_version: '70.0',
                read_critical: 'true',
                start: 'last',
                version: '2020.09.01.1010'
              }
            ])
            assert.ok(!usersDbInsert.called, 'update user doc')
          })
          .expect(200, {
            login: 'true',
            first: 'First Name',
            last: 'Last Name',
            otherData: 'moar'
          }, done)
      })

      it('should validate the stored mac address', function (done) {
        methodCall.callsFake(function request (_name, _data, cb) {
          cb(null, {
            login: 'true',
            first: 'First Name',
            last: 'Last Name',
            otherData: 'moar'
          })
        })

        const wrongMac = 'something'
        usersDbGet.resolves({
          ...userDoc,
          mac: wrongMac
        })
        usersDbInsert.resolves()

        request(server)
          .post('/api/login')
          .set('Content-Type', 'application/json')
          .set('x-andromeda-login-content-type', 'xml-rpc')
          .set('x-andromeda-login-user-id', userId)
          .send(data)
          .expect(
            'x-andromeda-session-id',
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          )
          .expect(res => {
            // adds the session Id to the session store
            const checkSession = app.get('checkSession')
            assert.strictEqual(
              checkSession(res.headers['x-andromeda-session-id']),
              'inactive'
            )
          })
          .expect(function () {
            assert.ok(
              /(?:[a-fA-F\d]{1,2}:){5}[a-fA-F\d]{1,2}/i.test(usersDbInsert.firstCall.firstArg.mac)
            )
            assert.ok(usersDbInsert.firstCall.firstArg.mac !== wrongMac, 'mac was updated')
            assert.strictEqual(
              usersDbInsert.firstCall.firstArg.mac,
              methodCall.firstCall.args[1][0].mac,
              'new mac was used for the login'
            )
            assert.strictEqual(
              usersDbInsert.firstCall.firstArg.mac,
              methodCall.firstCall.args[1][0].id0,
              'new mac was used for the login'
            )
          })
          .expect(200, {
            login: 'true',
            first: 'First Name',
            last: 'Last Name',
            otherData: 'moar'
          }, done)
      })

      it('should return a not found error if the user id is wrong', function (done) {
        const err = new Error('not found')
        err.status = 404
        usersDbGet.rejects(err)

        request(server)
          .post('/api/login')
          .set('Content-Type', 'application/json')
          .set('x-andromeda-login-content-type', 'xml-rpc')
          .set('x-andromeda-login-user-id', userId)
          .send(data)
          .expect(function (res) {
            assert.strictEqual(res.headers['x-andromeda-session-id'], undefined)
          })
          .expect(404, {
            errors: [
              {
                status: 404,
                detail: 'not found',
                title: 'Error'
              }
            ]
          }, done)
      })
    })
  })

  describe('LLSD', function () {
    const data = {
      first: 'Tester',
      last: 'MacTester',
      passwd: 'geheim',
      start: 'last',
      channel: 'andromeda-viewer',
      version: '2020.09.01.1010',
      platform: 'Mac',
      platform_version: '70.0',
      platform_string:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:80.0) Gecko/20100101 Firefox/80.0',
      options: [
        'buddy-list',
        'inventory-root',
        'inventory-skeleton'
      ],
      agree_to_tos: true,
      read_critical: true,
      viewer_digest: '',
      last_exec_event: 0,
      last_exec_duration: 0,
      address_size: 32
    }

    function loginRequest (ok, body, status) {
      fetch.resolves({
        ok,
        status: ok ? 200 : status || 500,
        headers: {
          get () {
            return 'application/llsd+xml'
          }
        },
        text () {
          return Promise.resolve(body)
        }
      })
    }

    describe('anonym', function () {
      it('should handle logins without an URL', function (done) {
        loginRequest(true, '<key>login</key><string>true</string>')

        request(server)
          .post('/api/login')
          .set('Content-Type', 'application/json')
          .set('x-andromeda-login-content-type', 'llsd')
          .send(data)
          .expect(
            'x-andromeda-session-id',
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          )
          .expect(200, '<key>login</key><string>true</string>')
          .end(err => {
            try {
              if (err) throw err

              assert.strictEqual(
                fetch.firstCall.firstArg.href,
                'https://login.agni.lindenlab.com/cgi-bin/login.cgi'
              )
              assert.deepStrictEqual(fetch.firstCall.args[1], {
                method: 'POST',
                headers: {
                  'content-type': 'application/llsd+xml'
                },
                body: '<?xml version="1.0" encoding="UTF-8"?>\n' +
                  '<llsd><map><key>first</key><string>Tester</string>' +
                  '<key>last</key><string>MacTester</string>' +
                  '<key>passwd</key><string>geheim</string><key>start</key><string>last</string>' +
                  '<key>channel</key><string>andromeda-viewer</string>' +
                  '<key>version</key><string>2020.09.01.1010</string><key>platform</key><string>' +
                  'Mac</string><key>platform_version</key><string>70.0</string>' +
                  '<key>platform_string</key><string>Mozilla/5.0 (Macintosh; Intel ' +
                  'Mac OS X 10.15; rv:80.0) Gecko/20100101 Firefox/80.0</string>' +
                  '<key>options</key><array><string>buddy-list</string><string>inventory-root' +
                  '</string><string>inventory-skeleton</string></array><key>agree_to_tos</key>' +
                  '<boolean>true</boolean><key>read_critical</key><boolean>true</boolean>' +
                  '<key>viewer_digest</key><string></string><key>last_exec_event</key>' +
                  '<integer>0</integer><key>last_exec_duration</key><integer>0</integer>' +
                  '<key>address_size</key><integer>32</integer><key>mac</key>' +
                  '<string>00:00:NaN:00:00:01</string><key>id0</key><string>00:00:NaN:00:00:01' +
                  '</string></map></llsd>\n'
              })
              done()
            } catch (err) {
              done(err)
            }
          })
      })

      it('should handle logins with an URL', function (done) {
        loginRequest(true, '<key>login</key><string>true</string>')
        const loginURL = 'http://login.osgrid.org/'

        request(server)
          .post('/api/login')
          .set('Content-Type', 'application/json')
          .set('x-andromeda-login-content-type', 'llsd')
          .set('x-andromeda-login-url', loginURL)
          .send(data)
          .expect(
            'x-andromeda-session-id',
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          )
          .expect(function () {
            assert.strictEqual(fetch.firstCall.firstArg.href, loginURL)
          })
          .expect(200, done)
      })

      it('should handle failed login requests', function (done) {
        loginRequest(true, '<key>login</key><string>false</string>')

        request(server)
          .post('/api/login')
          .set('Content-Type', 'application/json')
          .set('x-andromeda-login-content-type', 'llsd')
          .send(data)
          .expect(function (res) {
            assert.strictEqual(res.headers['x-andromeda-session-id'], undefined)
          })
          .expect(200, '<key>login</key><string>false</string>', done)
      })

      it('should validate the request', function (done) {
        request(server)
          .post('/api/login')
          .set('Content-Type', 'application/json')
          .set('x-andromeda-login-content-type', 'llsd')
          .send({
            ...data,
            last: undefined
          })
          .expect(function (res) {
            assert.strictEqual(res.headers['x-andromeda-session-id'], undefined)
          })
          .expect(400, {}, done)
      })

      it('should handle errors from fetch', function (done) {
        fetch.rejects(new Error('test'))

        request(server)
          .post('/api/login')
          .set('Content-Type', 'application/json')
          .set('x-andromeda-login-content-type', 'llsd')
          .send(data)
          .expect(function (res) {
            assert.strictEqual(res.headers['x-andromeda-session-id'], undefined)
          })
          .expect(500, {
            errors: [
              {
                status: 500,
                title: 'Error',
                detail: 'test'
              }
            ]
          }, done)
      })
    })

    describe('with logged in user', function () {
      const userId = '3989c4e7-e7ed-48a2-9f2a-a40e520ecd32'
      const userDoc = {
        _id: 'org.couchdb.user:3989c4e7-e7ed-48a2-9f2a-a40e520ecd32',
        _rev: '1-f0b0682c4700a3cbee99f6ed8cbee95c',
        type: 'user',
        name: '3989c4e7-e7ed-48a2-9f2a-a40e520ecd32',
        password_scheme: 'pbkdf2',
        derived_key: 'oisdfngioenf[gonweijfgnkjerngenfgienr',
        salt: 'idgijnepfgnerfngpo',
        roles: [],
        email: 'tester.mactestface@example.com'
      }
      const userDocWithMac = {
        ...userDoc,
        mac: 'db:35:c3:48:d8:4b'
      }

      it("should create a fake MAC-Address if the user doesn't have one", function (done) {
        loginRequest(true, '<key>login</key><string>true</string>')

        usersDbGet.resolves(userDoc)
        usersDbInsert.resolves()

        request(server)
          .post('/api/login')
          .set('Content-Type', 'application/json')
          .set('x-andromeda-login-content-type', 'llsd')
          .set('x-andromeda-login-user-id', userId)
          .send(data)
          .expect(
            'x-andromeda-session-id',
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          )
          .expect('Content-Type', 'application/llsd+xml; charset=utf-8')
          .expect(function () {
            assert.strictEqual(
              usersDbGet.firstCall.firstArg,
              'org.couchdb.user:3989c4e7-e7ed-48a2-9f2a-a40e520ecd32'
            )
            assert.ok(
              /(?:[a-fA-F\d]{1,2}:){5}[a-fA-F\d]{1,2}/i.test(usersDbInsert.firstCall.firstArg.mac)
            )
          })
          .expect(200, /<key>login<\/key><string>true<\/string>/, done)
      })

      it('should use the existing fake MAC-Address', function (done) {
        loginRequest(true, '<key>login</key><string>true</string>')

        usersDbGet.resolves(userDocWithMac)
        usersDbInsert.resolves()

        request(server)
          .post('/api/login')
          .set('Content-Type', 'application/json')
          .set('x-andromeda-login-content-type', 'llsd')
          .set('x-andromeda-login-user-id', userId)
          .send(data)
          .expect(
            'x-andromeda-session-id',
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          )
          .expect(function () {
            assert.ok(
              fetch.firstCall.args[1].body
                .includes('<key>id0</key><string>db:35:c3:48:d8:4b</string>'),
              'mac in request body'
            )
            assert.ok(
              fetch.firstCall.args[1].body
                .includes('<key>mac</key><string>db:35:c3:48:d8:4b</string>'),
              'mac in request body'
            )
            assert.ok(!usersDbInsert.called, 'update user doc')
          })
          .expect(200, /<key>login<\/key><string>true<\/string>/, done)
      })

      it('should validate the stored mac address', function (done) {
        loginRequest(true, '<key>login</key><string>true</string>')

        const wrongMac = 'something'
        usersDbGet.resolves({
          ...userDoc,
          mac: wrongMac
        })
        usersDbInsert.resolves()

        request(server)
          .post('/api/login')
          .set('Content-Type', 'application/json')
          .set('x-andromeda-login-content-type', 'llsd')
          .set('x-andromeda-login-user-id', userId)
          .send(data)
          .expect(
            'x-andromeda-session-id',
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          )
          .expect(function () {
            assert.ok(
              /(?:[a-fA-F\d]{1,2}:){5}[a-fA-F\d]{1,2}/i.test(usersDbInsert.firstCall.firstArg.mac)
            )
            assert.ok(usersDbInsert.firstCall.firstArg.mac !== wrongMac, 'mac was updated')
            assert.ok(
              fetch.firstCall.args[1].body
                .includes(usersDbInsert.firstCall.firstArg.mac),
              'new mac was used for the login'
            )
            assert.ok(
              fetch.firstCall.args[1].body
                .includes(usersDbInsert.firstCall.firstArg.mac),
              'new mac was used for the login'
            )
          })
          .expect(200, /<key>login<\/key><string>true<\/string>/, done)
      })

      it('should return a not found error if the user id is wrong', function (done) {
        const err = new Error('not found')
        err.status = 404
        usersDbGet.rejects(err)

        request(server)
          .post('/api/login')
          .set('Content-Type', 'application/json')
          .set('x-andromeda-login-content-type', 'llsd')
          .set('x-andromeda-login-user-id', userId)
          .send(data)
          .expect(function (res) {
            assert.strictEqual(res.headers['x-andromeda-session-id'], undefined)
          })
          .expect(404, {
            errors: [
              {
                status: 404,
                detail: 'not found',
                title: 'Error'
              }
            ]
          }, done)
      })
    })
  })
})
