const assert = require('assert')
const express = require('express')
const expressPouchDB = require('express-pouchdb')({
  inMemoryConfig: true,
  mode: 'fullCouchDB'
})
const proxyquire = require('proxyquire')
const request = require('supertest')
const uuid = require('uuid')

describe('account', function () {
  this.slow(200)

  const USER_ID = '3989c4e7-e7ed-48a2-9f2a-a40e520ecd32'
  const USER_DOC_ID = 'org.couchdb.user:' + USER_ID
  const USERNAME = 'tester.mactestface@example.com'
  const PASSWORD = 'bc0e734068f4ef43e22d84e3412c4c0221daa3a001fcd0c7ab24a565f9e7503d'

  let testApp
  let testServer
  let testUsersDb
  let server // express server

  before('start test server with pouchdb', function (done) {
    testApp = express()
    testApp.use(expressPouchDB)

    testServer = testApp.listen(0, () => {
      const port = testServer.address().port
      process.env.COUCH_URL = `http://localhost:${port}`
      done()
    })
  })

  beforeEach('setup server with pouchdb', function () {
    const PouchDB = proxyquire('pouchdb', {}).defaults({
      adapter: 'memory'
    })
    PouchDB.plugin(proxyquire('pouchdb-adapter-memory', {}))
    expressPouchDB.setPouchDB(PouchDB)
    testUsersDb = new PouchDB('_users')
  })

  beforeEach('load server', async function () {
    const backend = proxyquire('../server/index', {})
    server = backend.server
  })

  afterEach('close server', function (done) {
    server.close(done)
  })

  afterEach('destroy the user database', async function () {
    await testUsersDb.destroy()
  })

  after('close the server with pouchdb', function () {
    testServer.close()
  })

  // Helper functions
  function addUserDoc () {
    return testUsersDb.put({
      _id: USER_DOC_ID,
      type: 'user',
      name: USER_ID,
      roles: [],
      email: USERNAME,
      iterations: 10,
      password_scheme: 'pbkdf2',
      salt: '18c15d1931ab1571221ae1581841a91231551c01561971a8',
      derived_key: '1ac503f9e019b9338d5a3bce8fb619b7d3124fc8'
    })
  }

  describe('createIndex mail', function () {
    it('should call createIndex on the usersDb', async function () {
      await request(server)
        .put('/api/account')
        .send({
          data: {
            type: 'account',
            attributes: {
              username: USERNAME,
              password: PASSWORD
            }
          }
        })

      const { indexes } = await testUsersDb.getIndexes()
      assert.deepStrictEqual(indexes[1], {
        ddoc: '_design/users-by-email',
        def: {
          fields: [
            {
              email: 'asc'
            }
          ]
        },
        name: 'users-by-email',
        type: 'json'
      })
    })
  })

  describe('PUT', function () {
    it('should create a new account', async function () {
      const response = await request(server)
        .put('/api/account')
        .send({
          data: {
            type: 'account',
            attributes: {
              username: USERNAME,
              password: PASSWORD
            }
          }
        })
        .expect('Content-Type', /json/)
        .expect(200)

      assert.ok(response.body.links.self.endsWith('/api/account'), 'has a link to self')
      assert.ok(uuid.validate(response.body.data.id), 'ID is an UUID')
      assert.strictEqual(response.body.data.type, 'account', 'type is an account')
      assert.deepStrictEqual(response.body.data.attributes, {
        username: USERNAME
      }, 'returns the username')

      const userDoc = await testUsersDb.get('org.couchdb.user:' + response.body.data.id)
      assert.strictEqual(userDoc.type, 'user')
      assert.deepStrictEqual(userDoc.roles, [])
      assert.strictEqual(userDoc.email, USERNAME)
      assert.ok(uuid.validate(userDoc.name), 'user name is an UUID')
      assert.ok(uuid.validate(userDoc.email_validation), 'email validation is an UUID')
    })

    it('should create an account with a given ID', async function () {
      const id = uuid.v4()

      await request(server)
        .put('/api/account')
        .send({
          data: {
            type: 'account',
            id,
            attributes: {
              username: USERNAME,
              password: PASSWORD
            }
          }
        })
        .expect('Content-Type', /json/)
        .expect(200, {
          links: {
            self: 'undefined/api/account'
          },
          data: {
            type: 'account',
            id,
            attributes: {
              username: 'tester.mactestface@example.com'
            },
            relationships: {}
          }
        })
    })

    it('should return a conflict if an account with id exists', async function () {
      const id = uuid.v4()

      await testUsersDb.put({
        _id: 'org.couchdb.user:' + id,
        type: 'user',
        name: id,
        password: 'something',
        roles: [],
        email: 'tester@example.com'
      })

      await request(server)
        .put('/api/account')
        .send({
          data: {
            type: 'account',
            id,
            attributes: {
              username: USERNAME,
              password: PASSWORD
            }
          }
        })
        .expect('Content-Type', /json/)
        .expect(409, {
          errors: [
            {
              status: 409,
              title: 'conflict',
              detail: 'An account with that id already exists'
            }
          ]
        })
    })

    it('should return an error if the password is to short', async function () {
      await request(server)
        .put('/api/account')
        .send({
          data: {
            type: 'account',
            attributes: {
              username: USERNAME,
              password: 'bc0e734068f4ef43e22d84e3'
            }
          }
        })
        .expect('Content-Type', /json/)
        .expect(400, {
          errors: [
            {
              status: 400,
              title: 'Bad Request',
              detail: 'password must be the right size'
            }
          ]
        })
    })

    it('should return an error if the username is not an email-address', async function () {
      await request(server)
        .put('/api/account')
        .send({
          data: {
            type: 'account',
            attributes: {
              username: 'tester',
              password: PASSWORD
            }
          }
        })
        .expect('Content-Type', /json/)
        .expect(400, {
          errors: [
            {
              status: 400,
              title: 'Bad Request',
              detail: 'username must be an email-address'
            }
          ]
        })
    })

    it('should return a confict if the username already exists', async function () {
      const id = uuid.v4()
      await testUsersDb.put({
        _id: 'org.couchdb.user:' + id,
        type: 'user',
        name: id,
        password: 'something',
        roles: [],
        email: USERNAME
      })

      await request(server)
        .put('/api/account')
        .send({
          data: {
            type: 'account',
            attributes: {
              username: USERNAME,
              password: PASSWORD
            }
          }
        })
        .expect('Content-Type', /json/)
        .expect(409, {
          errors: [
            {
              status: 409,
              title: 'conflict',
              detail: 'An account with that username already exists'
            }
          ]
        })
    })
  })

  describe('GET', function () {
    it('should return user-data', async function () {
      await addUserDoc()

      await request(server)
        .get('/api/account')
        .auth(USERNAME, PASSWORD, { type: 'basic' })
        .expect('Content-Type', /json/)
        .expect(200, {
          links: {
            self: 'undefined/api/account'
          },
          data: {
            id: '3989c4e7-e7ed-48a2-9f2a-a40e520ecd32',
            type: 'account',
            attributes: {
              username: USERNAME
            },
            relationships: {}
          }
        })
    })

    it('should return an unauthorized error if the username is wrong', async function () {
      await request(server)
        .get('/api/account')
        .auth(USERNAME, PASSWORD, { type: 'basic' })
        .expect('Content-Type', /json/)
        .expect(401, {
          errors: [
            {
              status: 401,
              title: 'unauthorized',
              detail: 'Name or password is incorrect.'
            }
          ]
        })
    })

    it('should return an unauthorized error if the password is to short', async function () {
      await request(server)
        .get('/api/account')
        .auth(USERNAME, 'bc0e734068f4ef43e22d84', { type: 'basic' })
        .expect('Content-Type', /json/)
        .expect(401, {
          errors: [
            {
              status: 401,
              title: 'unauthorized',
              detail: 'Name or password is incorrect.'
            }
          ]
        })
    })

    it('should return an unauthorized error if CouchDB session fails', async function () {
      await addUserDoc()

      await request(server)
        .get('/api/account')
        .auth(
          USERNAME,
          Array.from(PASSWORD).reverse().join(''),
          { type: 'basic' }
        )
        .expect('Content-Type', /json/)
        .expect(401, {
          errors: [
            {
              status: 401,
              title: 'unauthorized',
              detail: 'Name or password is incorrect.'
            }
          ]
        })
    })
  })

  describe('PATCH', function () {
    it('should update the users document', async function () {
      await addUserDoc()
      const oldDoc = await testUsersDb.get(USER_DOC_ID)

      const result = await request(server)
        .patch('/api/account')
        .auth(USERNAME, PASSWORD, { type: 'basic' })
        .send({
          data: {
            type: 'account',
            attributes: {
              username: 'tester.other@example.com',
              password: '04b12153230f4de35c5158ae87be59a6665661b193d37a8754b169e4f1b96c37'
            }
          }
        })
        .expect(204)

      const userDoc = await testUsersDb.get(USER_DOC_ID)

      assert.deepStrictEqual(result.body, {}, 'result')

      assert.strictEqual(userDoc._id, USER_DOC_ID, '_id did not change')
      assert.strictEqual(userDoc.type, 'user', 'doc type did not change')
      assert.strictEqual(userDoc.name, USER_ID, 'user id (name field) did not change')
      assert.notStrictEqual(
        userDoc.derived_key,
        oldDoc.derived_key,
        'password (derived_key) was updated'
      )
      assert.deepStrictEqual(userDoc.roles, [], 'roles did not change')
      assert.deepStrictEqual(userDoc.email, 'tester.other@example.com', 'mail was updated')
      assert.ok(uuid.validate(userDoc.email_validation), 'email_validation is an UUID')
    })

    it('should update the user doc with only a password change', async function () {
      await addUserDoc()
      const oldDoc = await testUsersDb.get(USER_DOC_ID)

      await request(server)
        .patch('/api/account')
        .auth(USERNAME, PASSWORD, { type: 'basic' })
        .send({
          data: {
            type: 'account',
            attributes: {
              password: '04b12153230f4de35c5158ae87be59a6665661b193d37a8754b169e4f1b96c37'
            }
          }
        })
        .expect(204)

      const userDoc = await testUsersDb.get(USER_DOC_ID)

      assert.notStrictEqual(
        userDoc.derived_key,
        oldDoc.derived_key,
        'password (derived_key) was updated'
      )
      assert.strictEqual(userDoc.email, USERNAME, 'mail was not updated')
      assert.ok(!userDoc.email_validation, 'email_validation is not set')
    })

    it('should return an unauthorized error if the username is wrong', async function () {
      await request(server)
        .patch('/api/account')
        .auth('tester.mactestface@example.com', PASSWORD, { type: 'basic' })
        .send({
          data: {
            type: 'account',
            attributes: {
              password: '04b12153230f4de35c5158ae87be59a6665661b193d37a8754b169e4f1b96c37'
            }
          }
        })
        .expect(401, {
          errors: [
            {
              status: 401,
              title: 'unauthorized',
              detail: 'Name or password is incorrect.'
            }
          ]
        })
    })

    it('should return a conflict if the new username already exists', async function () {
      await addUserDoc()

      const id = 'something'
      const nextMail = 'next@example.com'

      await testUsersDb.put({
        _id: 'org.couchdb.user:' + id,
        type: 'user',
        name: id,
        roles: [],
        email: nextMail,
        iterations: 10,
        password_scheme: 'pbkdf2',
        salt: '18c15d1931ab1571221ae1581841a91231551c01561971a8',
        derived_key: '1ac503f9e019b9338d5a3bce8fb619b7d3124fc8'
      })

      await request(server)
        .patch('/api/account')
        .auth(USERNAME, PASSWORD, { type: 'basic' })
        .send({
          data: {
            type: 'account',
            attributes: {
              username: nextMail,
              password: '04b12153230f4de35c5158ae87be59a6665661b193d37a8754b169e4f1b96c37'
            }
          }
        })
        .expect(409, {
          errors: [
            {
              status: 409,
              title: 'conflict',
              detail: 'An account with that username already exists'
            }
          ]
        })
    })

    it(
      'should return an unauthorized error if CouchDB session fails / password is wrong',
      async function () {
        await addUserDoc()

        await request(server)
          .patch('/api/account')
          .auth(USERNAME, Array.from(PASSWORD).reverse().join(''), { type: 'basic' })
          .send({
            data: {
              type: 'account',
              attributes: {
                password: '04b12153230f4de35c5158ae87be59a6665661b193d37a8754b169e4f1b96c37'
              }
            }
          })
          .expect(401, {
            errors: [
              {
                status: 401,
                title: 'unauthorized',
                detail: 'Name or password is incorrect.'
              }
            ]
          })
      }
    )

    it('should return an bad request error if the updated username is not an email', async function () {
      await addUserDoc()

      await request(server)
        .patch('/api/account')
        .auth(USERNAME, PASSWORD, { type: 'basic' })
        .send({
          data: {
            type: 'account',
            attributes: {
              username: 'tester',
              password: '04b12153230f4de35c5158ae87be59a6665661b193d37a8754b169e4f1b96c37'
            }
          }
        })
        .expect(400, {
          errors: [
            {
              status: 400,
              title: 'Bad Request',
              detail: 'username must be an email-address'
            }
          ]
        })
    })

    it('should return an unauthorized error if the password is to short', async function () {
      await addUserDoc()

      await request(server)
        .patch('/api/account')
        .auth(USERNAME, 'bc0e734068f4ef43e22d84e3', { type: 'basic' })
        .send({
          data: {
            type: 'account',
            attributes: {
              password: '04b12153230f4de35c5158ae87be59a6665661b193d37a8754b169e4f1b96c37'
            }
          }
        })
        .expect(401, {
          errors: [
            {
              status: 401,
              title: 'unauthorized',
              detail: 'Name or password is incorrect.'
            }
          ]
        })
    })

    it('should return an Bad Request error if the updated password is to short', async function () {
      await addUserDoc()

      await request(server)
        .patch('/api/account')
        .auth(USERNAME, PASSWORD, { type: 'basic' })
        .send({
          data: {
            type: 'account',
            attributes: {
              password: '04b12153230f4de35c5158ae8'
            }
          }
        })
        .expect(400, {
          errors: [
            {
              status: 400,
              title: 'Bad Request',
              detail: 'password must be the right size'
            }
          ]
        })
    })
  })

  describe('DELETE', function () {
    it('should delete the user doc', async function () {
      await addUserDoc()

      await request(server)
        .delete('/api/account')
        .auth(USERNAME, PASSWORD, { type: 'basic' })
        .expect(204)

      await assert.rejects(
        async () => {
          await testUsersDb.get(USER_DOC_ID)
        },
        {
          docId: 'org.couchdb.user:3989c4e7-e7ed-48a2-9f2a-a40e520ecd32',
          error: true,
          message: 'missing',
          name: 'not_found',
          reason: 'deleted',
          status: 404
        }
      )
    })

    it('should return an unauthorized error if the username is wrong', async function () {
      await request(server)
        .delete('/api/account')
        .auth(
          'tester.mactestface@example.com',
          'bc0e734068f4ef43e22d84e3412c4c0221daa3a001fcd0c7ab24a565f9e7503d',
          { type: 'basic' }
        )
        .expect(401, {
          errors: [
            {
              status: 401,
              title: 'unauthorized',
              detail: 'Name or password is incorrect.'
            }
          ]
        })
    })

    it('should return an unauthorized error if the password is to short', async function () {
      await request(server)
        .delete('/api/account')
        .auth(USERNAME, 'bc0e734068f4ef43e22d84e3412', { type: 'basic' })
        .expect(401, {
          errors: [
            {
              status: 401,
              title: 'unauthorized',
              detail: 'Name or password is incorrect.'
            }
          ]
        })
    })

    it('should return an unauthorized error if CouchDB session fails', async function () {
      await addUserDoc()

      await request(server)
        .delete('/api/account')
        .auth(USERNAME, Array.from(PASSWORD).reverse().join(''), { type: 'basic' })
        .expect(401, {
          errors: [
            {
              status: 401,
              title: 'unauthorized',
              detail: 'Name or password is incorrect.'
            }
          ]
        })
    })
  })
})
