const assert = require('assert')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const request = require('supertest')
const uuid = require('uuid')

describe('account', function () {
  let clock
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
    clock = sinon.useFakeTimers(Date.now())
  })

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

  afterEach('restore timers', function () {
    clock.restore()
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
          email: 'tester.mactestface@example.com'
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
      await clock.nextAsync()

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

  describe('PUT', function () {
    it('should create a new account', function (done) {
      usersDbFind.resolves({ docs: [] })
      usersDbInsert.resolves()

      request(server)
        .put('/api/account')
        .send({
          data: {
            type: 'account',
            attributes: {
              username: 'tester.mactestface@example.com',
              password: 'bc0e734068f4ef43e22d84e3412c4c0221daa3a001fcd0c7ab24a565f9e7503d'
            }
          }
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          try {
            if (err) throw err

            assert.ok(res.body.links.self.endsWith('/api/account'), 'has a link to self')
            assert.ok(uuid.validate(res.body.data.id), 'ID is an UUID')
            assert.strictEqual(res.body.data.type, 'account', 'type is an account')
            assert.deepStrictEqual(res.body.data.attributes, {
              username: 'tester.mactestface@example.com'
            }, 'returns the username')

            assert.deepStrictEqual(usersDbFind.firstCall.firstArg, {
              selector: {
                email: 'tester.mactestface@example.com'
              },
              fields: ['_id', 'email']
            })
            const userDoc = usersDbInsert.firstCall.firstArg
            assert.strictEqual(userDoc.type, 'user')
            assert.strictEqual(
              userDoc.password,
              'bc0e734068f4ef43e22d84e3412c4c0221daa3a001fcd0c7ab24a565f9e7503d'
            )
            assert.deepStrictEqual(userDoc.roles, [])
            assert.strictEqual(userDoc.email, 'tester.mactestface@example.com')
            assert.ok(uuid.validate(userDoc.name), 'user name is an UUID')
            assert.ok(uuid.validate(userDoc.email_validation), 'email validation is an UUID')

            done()
          } catch (err) {
            done(err)
          }
        })
    })

    it('should create an account with a given ID', function (done) {
      usersDbFind.resolves({ docs: [] })
      usersDbInsert.resolves({ ok: true })
      usersDbHead.rejects({ statusCode: 404 })
      const id = uuid.v4()

      request(server)
        .put('/api/account')
        .send({
          data: {
            type: 'account',
            id,
            attributes: {
              username: 'tester.mactestface@example.com',
              password: 'bc0e734068f4ef43e22d84e3412c4c0221daa3a001fcd0c7ab24a565f9e7503d'
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
        }, done)
    })

    it('should return a conflict if an account with id exists', function (done) {
      const id = uuid.v4()
      usersDbFind.resolves({ docs: [] })
      usersDbInsert.resolves({ ok: true })
      usersDbHead.resolves({ _id: id })

      request(server)
        .put('/api/account')
        .send({
          data: {
            type: 'account',
            id,
            attributes: {
              username: 'tester.mactestface@example.com',
              password: 'bc0e734068f4ef43e22d84e3412c4c0221daa3a001fcd0c7ab24a565f9e7503d'
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
        }, done)
    })

    it('should return an error if the password is to short', function (done) {
      request(server)
        .put('/api/account')
        .send({
          data: {
            type: 'account',
            attributes: {
              username: 'tester.mactestface@example.com',
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
        }, done)
    })

    it('should return an error if the username is not an email-address', function (done) {
      request(server)
        .put('/api/account')
        .send({
          data: {
            type: 'account',
            attributes: {
              username: 'tester',
              password: 'bc0e734068f4ef43e22d84e3412c4c0221daa3a001fcd0c7ab24a565f9e7503d'
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
        }, done)
    })

    it('should return a confict if the username already exists', function (done) {
      usersDbFind.resolves({ docs: [{ email: 'tester.mactestface@example.com' }] })

      request(server)
        .put('/api/account')
        .send({
          data: {
            type: 'account',
            attributes: {
              username: 'tester.mactestface@example.com',
              password: 'bc0e734068f4ef43e22d84e3412c4c0221daa3a001fcd0c7ab24a565f9e7503d'
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
        }, done)
    })
  })

  describe('GET', function () {
    it('should return user-data', function (done) {
      findReturnsUserDoc()
      sessionResult(true)

      request(server)
        .get('/api/account')
        .auth(
          'tester.mactestface@example.com',
          'bc0e734068f4ef43e22d84e3412c4c0221daa3a001fcd0c7ab24a565f9e7503d',
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
              username: 'tester.mactestface@example.com'
            },
            relationships: {}
          }
        })
        .end(err => {
          try {
            if (err) throw err

            assert.deepStrictEqual(usersDbFind.firstCall.firstArg, {
              selector: {
                email: 'tester.mactestface@example.com'
              }
            })

            done()
          } catch (err) {
            done(err)
          }
        })
    })

    it('should return an unauthorized error if the username is wrong', function (done) {
      findReturnsNothing()

      request(server)
        .get('/api/account')
        .auth(
          'tester.mactestface@example.com',
          'bc0e734068f4ef43e22d84e3412c4c0221daa3a001fcd0c7ab24a565f9e7503d',
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
        }, done)
    })

    it('should return an unauthorized error if the password is to short', function (done) {
      request(server)
        .get('/api/account')
        .auth(
          'tester.mactestface@example.com',
          'bc0e734068f4ef43e22d84',
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
        }, done)
    })

    it('should return an unauthorized error if CouchDB session fails', function (done) {
      findReturnsUserDoc()
      sessionResult(false)

      request(server)
        .get('/api/account')
        .auth(
          'tester.mactestface@example.com',
          'bc0e734068f4ef43e22d84e3412c4c0221daa3a001fcd0c7ab24a565f9e7503d',
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
        }, done)
    })
  })

  describe('PATCH', function () {
    beforeEach(function () {
      usersDbInsert.resolves()
    })

    it('should update the users document', function (done) {
      findReturnsUserDoc()
      sessionResult(true)

      request(server)
        .patch('/api/account')
        .auth(
          'tester.mactestface@example.com',
          'bc0e734068f4ef43e22d84e3412c4c0221daa3a001fcd0c7ab24a565f9e7503d',
          { type: 'basic' }
        )
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
        .end(err => {
          try {
            if (err) throw err

            assert.deepStrictEqual(usersDbFind.firstCall.firstArg, {
              selector: {
                email: 'tester.mactestface@example.com'
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

            done()
          } catch (err) {
            done(err)
          }
        })
    })

    it('should update the user doc with only a password change', function (done) {
      findReturnsUserDoc()
      sessionResult(true)

      request(server)
        .patch('/api/account')
        .auth(
          'tester.mactestface@example.com',
          'bc0e734068f4ef43e22d84e3412c4c0221daa3a001fcd0c7ab24a565f9e7503d',
          { type: 'basic' }
        )
        .send({
          data: {
            type: 'account',
            attributes: {
              password: '04b12153230f4de35c5158ae87be59a6665661b193d37a8754b169e4f1b96c37'
            }
          }
        })
        .expect(204)
        .end(err => {
          try {
            if (err) throw err

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
              email: 'tester.mactestface@example.com'
            })

            done()
          } catch (err) {
            done(err)
          }
        })
    })

    it('should return an unauthorized error if the username is wrong', function (done) {
      findReturnsNothing()

      request(server)
        .patch('/api/account')
        .auth(
          'tester.mactestface@example.com',
          'bc0e734068f4ef43e22d84e3412c4c0221daa3a001fcd0c7ab24a565f9e7503d',
          { type: 'basic' }
        )
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
        }, done)
    })

    it('should return an bad request error if the updated username is not an email', function (done) {
      findReturnsUserDoc()
      sessionResult(true)

      request(server)
        .patch('/api/account')
        .auth(
          'tester.mactestface@example.com',
          'bc0e734068f4ef43e22d84e3412c4c0221daa3a001fcd0c7ab24a565f9e7503d',
          { type: 'basic' }
        )
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
        }, done)
    })

    it('should return an unauthorized error if the password is to short', function (done) {
      findReturnsNothing()

      request(server)
        .patch('/api/account')
        .auth('tester.mactestface@example.com', 'bc0e734068f4ef43e22d84e3', { type: 'basic' })
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
        }, done)
    })

    it('should return an Bad Request error if the updated password is to short', function (done) {
      findReturnsUserDoc()
      sessionResult(true)

      request(server)
        .patch('/api/account')
        .auth(
          'tester.mactestface@example.com',
          'bc0e734068f4ef43e22d84e3412c4c0221daa3a001fcd0c7ab24a565f9e7503d',
          { type: 'basic' }
        )
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
        }, done)
    })

    it('should return an unauthorized error if CouchDB session fails', function (done) {
      findReturnsUserDoc()
      sessionResult(false)

      request(server)
        .patch('/api/account')
        .auth(
          'tester.mactestface@example.com',
          'bc0e734068f4ef43e22d84e3412c4c0221daa3a001fcd0c7ab24a565f9e7503d',
          { type: 'basic' }
        )
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
        }, done)
    })
  })

  describe('DELETE', function () {
    beforeEach(function () {
      usersDbDestroy.resolves()
    })

    it('should delete the user doc', function (done) {
      findReturnsUserDoc()
      sessionResult(true)

      request(server)
        .delete('/api/account')
        .auth(
          'tester.mactestface@example.com',
          'bc0e734068f4ef43e22d84e3412c4c0221daa3a001fcd0c7ab24a565f9e7503d',
          { type: 'basic' }
        )
        .expect(204)
        .end(err => {
          try {
            if (err) throw err

            assert.deepStrictEqual(usersDbFind.firstCall.firstArg, {
              selector: {
                email: 'tester.mactestface@example.com'
              }
            })

            assert.deepStrictEqual(usersDbDestroy.firstCall.args, [
              'org.couchdb.user:3989c4e7-e7ed-48a2-9f2a-a40e520ecd32',
              '1-f0b0682c4700a3cbee99f6ed8cbee95c'
            ])

            done()
          } catch (err) {
            done(err)
          }
        })
    })

    it('should return an unauthorized error if the username is wrong', function (done) {
      findReturnsNothing()

      request(server)
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
        }, done)
    })

    it('should return an unauthorized error if the password is to short', function (done) {
      findReturnsNothing()

      request(server)
        .delete('/api/account')
        .auth(
          'tester.mactestface@example.com',
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
        }, done)
    })

    it('should return an unauthorized error if CouchDB session fails', function (done) {
      findReturnsUserDoc()
      sessionResult(false)

      request(server)
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
        }, done)
    })
  })
})
