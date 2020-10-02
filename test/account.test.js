'use strict'

const assert = require('assert')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const request = require('supertest')
const uuid = require('uuid')

describe('account', function () {
  const USERNAME = 'tester.mactestface@example.com'
  const PASSWORD = 'bc0e734068f4ef43e22d84e3412c4c0221daa3a001fcd0c7ab24a565f9e7503d'

  let server // express server
  let usersDbCreateIndex
  let usersDbFind
  let usersDbHead
  let usersDbInsert
  let usersDbDestroy
  let dbCreate
  let dbDestroy
  let fetch

  beforeEach(function () {
    usersDbCreateIndex = sinon.stub()
    usersDbFind = sinon.stub()
    usersDbHead = sinon.stub()
    usersDbInsert = sinon.stub()
    usersDbDestroy = sinon.stub()
    dbCreate = sinon.stub()
    dbDestroy = sinon.stub()
    fetch = sinon.stub()
    fetch['@global'] = true

    usersDbCreateIndex.resolves()

    const backend = proxyquire('../server/index', {
      './db': {
        '@global': true,
        usersDB: {
          createIndex: usersDbCreateIndex,
          find: usersDbFind,
          head: usersDbHead,
          insert: usersDbInsert,
          destroy: usersDbDestroy
        },
        nano: {
          db: {
            create: dbCreate,
            destroy: dbDestroy
          }
        }
      },
      'node-fetch': fetch
    })
    server = backend.server
  })

  afterEach('close server', function (done) {
    server.close(done)
  })

  // Helper functions
  function findReturnsUserDoc () {
    usersDbFind.resolves({
      docs: [
        {
          _id: 'org.couchdb.user:3989c4e7-e7ed-48a2-9f2a-a40e520ecd32',
          _rev: '1-f0b0682c4700a3cbee99f6ed8cbee95c',
          type: 'user',
          name: '3989c4e7-e7ed-48a2-9f2a-a40e520ecd32',
          password_scheme: 'pbkdf2',
          derived_key: 'oisdfngioenf[gonweijfgnkjerngenfgienr',
          salt: 'idgijnepfgnerfngpo',
          roles: [],
          email: USERNAME
        }
      ]
    })
  }

  function findReturnsNothing () {
    usersDbFind.resolves({ docs: [] })
  }

  function sessionResult (isSuccess) {
    fetch.resolves({
      status: isSuccess ? 200 : 401,
      json () {
        return Promise.resolve({ ok: isSuccess })
      }
    })
  }

  describe('createIndex mail', function () {
    it('should call createIndex on the usersDb', async function () {
      usersDbFind.resolves({ docs: [] })
      usersDbInsert.resolves()

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
        .expect(200)
        .expect(() => {
          assert.ok(usersDbCreateIndex.calledOnce, 'createIndex was called')
          assert.deepStrictEqual(usersDbCreateIndex.firstCall.firstArg, {
            index: {
              fields: ['email']
            },
            ddoc: 'users-by-email',
            name: 'users-by-email'
          }, 'createIndex index argument')
        })

    })
  })

  describe('PUT', function () {
    it('should create a new account', async function () {
      usersDbFind.resolves({ docs: [] })
      usersDbInsert.resolves()

      const res = await request(server)
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

      assert.ok(res.body.links.self.endsWith('/api/account'), 'has a link to self')
      assert.ok(uuid.validate(res.body.data.id), 'ID is an UUID')
      assert.strictEqual(res.body.data.type, 'account', 'type is an account')
      assert.deepStrictEqual(res.body.data.attributes, {
        username: USERNAME
      }, 'returns the username')

      assert.deepStrictEqual(usersDbFind.firstCall.firstArg, {
        selector: {
          email: USERNAME
        },
        fields: ['_id', 'email']
      })
      const userDoc = usersDbInsert.firstCall.firstArg
      assert.strictEqual(userDoc.type, 'user')
      assert.strictEqual(
        userDoc.password,
        PASSWORD
      )
      assert.deepStrictEqual(userDoc.roles, [])
      assert.strictEqual(userDoc.email, USERNAME)
      assert.ok(uuid.validate(userDoc.name), 'user name is an UUID')
      assert.ok(uuid.validate(userDoc.email_validation), 'email validation is an UUID')
    })

    it('should create an account with a given ID', async function () {
      usersDbFind.resolves({ docs: [] })
      usersDbInsert.resolves({ ok: true })
      usersDbHead.rejects({ statusCode: 404 })
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
              username: USERNAME
            },
            relationships: {}
          }
        })
    })

    it('should return a conflict if an account with id exists', async function () {
      const id = uuid.v4()
      usersDbFind.resolves({ docs: [] })
      usersDbInsert.resolves({ ok: true })
      usersDbHead.resolves({ _id: id })

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
      usersDbFind.resolves({ docs: [{ email: USERNAME }] })

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
      findReturnsUserDoc()
      sessionResult(true)

      await request(server)
        .get('/api/account')
        .auth(
          USERNAME,
          PASSWORD,
          { type: 'basic' }
        )
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

      assert.deepStrictEqual(usersDbFind.firstCall.firstArg, {
        selector: {
          email: USERNAME
        }
      })
    })

    it('should return an unauthorized error if the username is wrong', async function () {
      findReturnsNothing()

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
        .auth(USERNAME, 'bc0e734068f4ef43e22d84e3', { type: 'basic' })
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
      findReturnsUserDoc()
      sessionResult(false)

      await request(server)
        .get('/api/account')
        .auth(
          USERNAME,
          PASSWORD,
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
    beforeEach(function () {
      usersDbInsert.resolves()
    })

    it('should update the users document', async function () {
      findReturnsUserDoc()
      usersDbFind.onSecondCall().resolves({ docs: [] })
      sessionResult(true)

      await request(server)
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

      assert.deepStrictEqual(usersDbFind.firstCall.firstArg, {
        selector: {
          email: USERNAME
        }
      })

      const userDoc = usersDbInsert.firstCall.firstArg
      assert.strictEqual(userDoc._id, 'org.couchdb.user:3989c4e7-e7ed-48a2-9f2a-a40e520ecd32')
      assert.strictEqual(userDoc.type, 'user')
      assert.strictEqual(userDoc.name, '3989c4e7-e7ed-48a2-9f2a-a40e520ecd32')
      assert.strictEqual(
        userDoc.password,
        '04b12153230f4de35c5158ae87be59a6665661b193d37a8754b169e4f1b96c37'
      )
      assert.deepStrictEqual(userDoc.roles, [])
      assert.deepStrictEqual(userDoc.email, 'tester.other@example.com')
      assert.ok(uuid.validate(userDoc.email_validation), 'email_validation is an UUID')
    })

    it('should update the user doc with only a password change', async function () {
      findReturnsUserDoc()
      sessionResult(true)

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

      assert.deepStrictEqual(usersDbInsert.firstCall.firstArg, {
        _id: 'org.couchdb.user:3989c4e7-e7ed-48a2-9f2a-a40e520ecd32',
        _rev: '1-f0b0682c4700a3cbee99f6ed8cbee95c',
        type: 'user',
        name: '3989c4e7-e7ed-48a2-9f2a-a40e520ecd32',
        password: '04b12153230f4de35c5158ae87be59a6665661b193d37a8754b169e4f1b96c37',
        password_scheme: 'pbkdf2',
        derived_key: 'oisdfngioenf[gonweijfgnkjerngenfgienr',
        salt: 'idgijnepfgnerfngpo',
        roles: [],
        email: USERNAME
      })
    })

    it('should return a conflict if the new username already exists', async function () {
      const id = 'something'
      const nextMail = 'next@example.com'

      findReturnsUserDoc()
      usersDbFind.onSecondCall().resolves({
        docs: [
          {
            _id: 'org.couchdb.user:' + id,
            _rev: '1-f0b0682c4700a3cbee99f6ed8cbee95c',
            type: 'user',
            name: id,
            password_scheme: 'pbkdf2',
            derived_key: 'oisdfngioenf[gonweijfgnkjerngenfgienr',
            salt: 'idgijnepfgnerfngpo',
            roles: [],
            email: nextMail
          }
        ]
      })
      sessionResult(true)

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

    it('should return an unauthorized error if the username is wrong', async function () {
      findReturnsNothing()

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

    it('should return an bad request error if the updated username is not an email', async function () {
      findReturnsUserDoc()
      sessionResult(true)

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
      findReturnsNothing()

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
      findReturnsUserDoc()
      sessionResult(true)

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

    it('should return an unauthorized error if CouchDB session fails', async function () {
      findReturnsUserDoc()
      sessionResult(false)

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

  describe('DELETE', function () {
    beforeEach(function () {
      usersDbDestroy.resolves()
    })

    it('should delete the user doc', async function () {
      findReturnsUserDoc()
      sessionResult(true)

      await request(server)
        .delete('/api/account')
        .auth(USERNAME, PASSWORD, { type: 'basic' })
        .expect(204)

      assert.deepStrictEqual(usersDbFind.firstCall.firstArg, {
        selector: {
          email: USERNAME
        }
      })

      assert.deepStrictEqual(usersDbDestroy.firstCall.args, [
        'org.couchdb.user:3989c4e7-e7ed-48a2-9f2a-a40e520ecd32',
        '1-f0b0682c4700a3cbee99f6ed8cbee95c'
      ])
    })

    it('should return an unauthorized error if the username is wrong', async function () {
      findReturnsNothing()

      await request(server)
        .delete('/api/account')
        .auth(USERNAME, PASSWORD, { type: 'basic' })
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
      findReturnsNothing()

      await request(server)
        .delete('/api/account')
        .auth(
          USERNAME,
          'bc0e734068f4ef43e22d84e3412',
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

    it('should return an unauthorized error if CouchDB session fails', async function () {
      findReturnsUserDoc()
      sessionResult(false)

      await request(server)
        .delete('/api/account')
        .auth(USERNAME, PASSWORD, { type: 'basic' })
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
