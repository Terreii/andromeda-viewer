const basicAuth = require('basic-auth')
const express = require('express')
const { body, header, validationResult } = require('express-validator')
const nano = require('nano')(process.env.COUCH_URL || 'http://localhost:5984')
const fetch = require('node-fetch')
const pouchErrors = require('pouchdb-errors')
const { v4: uuid } = require('uuid')

const api = express.Router()
api.use(express.json())
const usersDB = nano.db.use('_users')

module.exports = api

const minPasswordLength = 8

/**
 * This is the server side implementation of the account and session API.
 * It is inspired by Hoodies API. https://github.com/hoodiehq/account-json-api
 * But it should be minimal and mostly use CouchDB's API.
 */

/**
 * An email is used for the user to sign in. But the CouchDB-Username is a UUID.
 * This is done to be able to change the login-name (email) without having to create a new database
 * and sync the old data to it, when to user changes their email-address.
 *
 * Most of those routes only exist as a bridge between username and email.
 */

// Create the email to user index.
usersDB.createIndex({
  index: {
    fields: ['email']
  },
  ddoc: 'users-by-email',
  name: 'users-by-email'
}).catch(err => {
  console.error("couldn't create the email index\nlogins will be slower!", err)
})

// sign up
api.put(
  '/account',
  body('data.type').equals('account'),
  body('data.id').optional().isUUID(),
  body('data.attributes.username').isEmail(),
  body('data.attributes.password').isLength({ min: minPasswordLength }),
  async (req, res, next) => {
    try {
      // handle the validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw errors.array().map(error => ({
          ...error,
          status: 400,
          title: 'Bad Request',
          detail: error.msg
        }))
      }

      const { attributes: { username, password }, id } = req.body.data
      // check if an user exist with that login-username/email
      const { docs } = await usersDB.find({
        selector: {
          email: username
        },
        fields: ['_id', 'email']
      })

      if (docs.length > 0) {
        throw pouchErrors.createError(
          pouchErrors.REV_CONFLICT,
          'An account with that username already exists'
        )
      }

      // If an ID was send, check if an user exists with that id.
      if (id) {
        const exists = await usersDB.head('org.couchdb.user:' + id)
          .then(() => true)
          .catch(error => {
            if (error.statusCode === 404) {
              return false
            }
            throw error
          })

        if (exists) {
          throw pouchErrors.createError(
            pouchErrors.REV_CONFLICT,
            'An account with that id already exists'
          )
        }
      }

      // Create the user
      const userID = id || uuid()
      // Add an email validation key
      const emailValidation = uuid()
      await usersDB.insert({
        _id: 'org.couchdb.user:' + userID,
        type: 'user',
        name: userID,
        password,
        roles: [],
        email: username,
        email_validation: emailValidation // if validated, this field will be deleted
      })

      // TODO: send email

      if (process.env.NODE_ENV === 'development') {
        await nano.db.create('userdb-' + Buffer.from(userID).toString('hex'))
      }

      res.type('application/vnd.api+json')
      res.status(200).json({
        links: {
          self: req.app.get('host') + req.originalUrl
        },
        data: {
          id: userID,
          type: 'account',
          attributes: {
            username
          },
          relationships: {}
        }
      })
    } catch (error) {
      next(error)
    }
  }
)

// get user data
api.get('/account', ...createAuthValidator(), async (req, res) => {
  res.type('application/vnd.api+json')

  // Send the user infos
  res.status(200).json({
    links: {
      self: req.app.get('host') + req.originalUrl
    },
    data: {
      // id will later be used for syncing.
      id: req.user.name,
      type: 'account',
      attributes: {
        username: req.user.email
      },
      relationships: {}
    }
  })
})

// update account
api.patch(
  '/account',
  ...createAuthValidator(),
  body('data.type').equals('account'),
  body('data.attributes.username').optional().isEmail(),
  body('data.attributes.password').optional().isLength({ min: minPasswordLength }),
  async (req, res, next) => {
    try {
      // handle the validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw errors.array().map(error => ({
          ...error,
          status: 400,
          title: 'Bad Request',
          detail: error.msg
        }))
      }

      let didChange = false
      const { attributes: { username, password } } = req.body.data

      if (password) {
        req.user.password = password
        didChange = true
      }

      if (username && username !== req.user.email) {
        didChange = true
        req.user.email = username
        // todo send validation email and set email_validation to an UUID
      }

      // only update user-doc if something did change.
      if (didChange) {
        await usersDB.insert(req.user)
      }
      res.status(204).send('')
    } catch (err) {
      next(err)
    }
  }
)

// delete account
api.delete('/account', ...createAuthValidator(), async (req, res, next) => {
  try {
    await usersDB.destroy(req.user._id, req.user._rev)

    if (process.env.NODE_ENV === 'development') {
      await nano.db.destroy('userdb-' + Buffer.from(req.user._id).toString('hex'))
    }

    res.status(204).send('')
  } catch (err) {
    next(err)
  }
})

// log in
api.put('', notImplemented)

// is logged in
api.get('', notImplemented)

// log off
api.delete('', notImplemented)

// Error handler
// This transforms the different error styles into application/vnd.api+json errors.
api.use((err, req, res, next) => {
  if (!err) {
    next()
    return
  }
  res.type('application/vnd.api+json')

  const getStatus = anError => Number(anError.status || anError.statusCode) || 500
  const format = anError => ({
    status: getStatus(anError),
    title: anError.title || anError.name,
    detail: anError.detail || anError.message
  })

  if (Array.isArray(err)) {
    res.status(getStatus(err[0]))
    res.json({
      errors: err.map(format)
    })
  } else {
    res.status(getStatus(err))
    res.json({
      errors: [format(err)]
    })
  }
})

/**
 * Create an Authorization validator.
 * Is validates that there is a Basic Authorization header is there and uses it.
 */
function createAuthValidator () {
  return [
    header('Authorization').exists(),
    (req, res, next) => {
      // handle the validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        next(pouchErrors.createError(
          pouchErrors.UNAUTHORIZED,
          'Authorization header missing'
        ))
      } else {
        next()
      }
    },
    authentication
  ]
}

/**
 * Handle Basic Authentication.
 * @param {express.Request}      req   Express' request object.
 * @param {express.Response}     res   Express' response object.
 * @param {express.NextFunction} next  Call the next middleware.
 */
async function authentication (req, res, next) {
  try {
    const { name: username, pass: password } = basicAuth(req) || {}

    // check if the username and password matches the requirements
    if (
      username == null ||
      username.length === 0 ||
      password == null ||
      password.length < minPasswordLength
    ) {
      throw pouchErrors.UNAUTHORIZED
    }

    // Find the document of the user.
    const { docs } = await usersDB.find({
      selector: {
        email: username
      }
    })

    // If the user doesn't exist
    if (docs.length === 0) {
      throw pouchErrors.UNAUTHORIZED
    }
    const user = docs[0]

    // Use the CouchDB session API for checking the password.
    // This works on CouchDB and PouchDB-Server and CouchDB with per-document-access.
    // Also if the settings and/or hashing algorithm changes, then it would still work!
    const sessionUrl = new URL('/_session', process.env.COUCH_URL || 'http://localhost:5984')
    sessionUrl.username = ''
    sessionUrl.password = ''
    const response = await fetch(sessionUrl.href, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: user.name,
        password
      })
    })
    if (response.status === 401 || !(await response.json()).ok) {
      throw pouchErrors.UNAUTHORIZED
    } else {
      req.user = user
      next()
    }
  } catch (error) {
    next(error)
  }
}

function notImplemented () {
  const error = new Error('Not yet implemented')
  error.status = 501
  error.name = 'Not Implemented'
  throw error
}
