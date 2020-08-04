const basicAuth = require('basic-auth')
const express = require('express')
const { body, header, validationResult } = require('express-validator')
const nano = require('nano')(process.env.COUCH_URL || 'http://localhost:5984')
const fetch = require('node-fetch')
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
  async (req, res) => {
    res.type('application/vnd.api+json')

    // handle the validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400)
      res.json({
        errors: errors.array().map(error => ({
          ...error,
          status: '400',
          title: 'Bad Request',
          detail: error.msg
        }))
      })
      return
    }

    const { attributes: { username, password }, id } = req.body.data
    try {
      // check if an user exist with that login-username/email
      const docs = await usersDB.find({
        selector: {
          email: username
        },
        fields: ['_id', 'name', 'email']
      })

      if (docs.docs.length > 0) {
        res.status(409)
        res.json({
          errors: [
            {
              status: '409',
              title: 'Conflict',
              detail: 'An account with that username already exists'
            }
          ]
        })
        return
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
          res.status(409)
          res.json({
            errors: [
              {
                status: '409',
                title: 'Conflict',
                detail: 'An account with that id already exists'
              }
            ]
          })
          return
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
      res.status(200).json({
        errors: [
          {
            status: '500',
            title: 'Internal Server Error',
            detail: error.toString()
          }
        ]
      })
    }
  }
)

// get user data
api.get('/account', header('Authorization'), async (req, res) => {
  res.type('application/vnd.api+json')

  // handle the validation errors
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(401)
    res.json({
      errors: [{
        status: '401',
        title: 'Unauthorized',
        detail: 'Authorization header missing'
      }]
    })
    return
  }

  try {
    const { name: username, pass: password } = basicAuth(req) || {}

    // check if the username and password matches the requirements
    if (
      username == null ||
      username.length === 0 ||
      password == null ||
      password.length < minPasswordLength
    ) {
      sendUnauthorized(res)
      return
    }

    // Find the document of the user.
    const docs = await usersDB.find({
      selector: {
        email: username
      }
    })

    // If the user doesn't exist
    if (docs.docs.length === 0) {
      sendUnauthorized(res)
      return
    }
    const user = docs.docs[0]

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
      sendUnauthorized(res)
      return
    }

    // Send the user infos
    res.status(200).json({
      links: {
        self: req.app.get('host') + req.originalUrl
      },
      data: {
        // id will later be used for syncing.
        id: user.name,
        type: 'account',
        attributes: {
          username: user.email
        },
        relationships: {}
      }
    })
  } catch (error) {
    res.status(200).json({
      errors: [
        {
          status: '500',
          title: 'Internal Server Error',
          detail: error.toString()
        }
      ]
    })
  }
})

// update account
api.patch('/account', (req, res) => {
  res.status(500).json({
    errors: [
      {
        status: '500',
        title: 'Not Implemented',
        detail: 'Not yet implemented'
      }
    ]
  })
})

// delete account
api.delete('/account', (req, res) => {
  res.status(500).json({
    errors: [
      {
        status: '500',
        title: 'Not Implemented',
        detail: 'Not yet implemented'
      }
    ]
  })
})

// log in
api.put('', (req, res) => {
  res.status(500).json({
    errors: [
      {
        status: '500',
        title: 'Not Implemented',
        detail: 'Not yet implemented'
      }
    ]
  })
})

// is logged in
api.get('', (req, res) => {
  res.status(500).json({
    errors: [
      {
        status: '500',
        title: 'Not Implemented',
        detail: 'Not yet implemented'
      }
    ]
  })
})

// log off
api.delete('', (req, res) => {
  res.status(500).json({
    errors: [
      {
        status: '500',
        title: 'Not Implemented',
        detail: 'Not yet implemented'
      }
    ]
  })
})

/**
 * Create an unauthorized error response.
 * Should return after calling this function.
 * @param {express.response} res Response object from Express.js
 */
function sendUnauthorized (res) {
  res.status(401)
  res.json({
    errors: [{
      status: '401',
      title: 'Unauthorized',
      detail: 'Invalid credential'
    }]
  })
}
