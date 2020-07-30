const express = require('express')
const { body, validationResult } = require('express-validator')
const nano = require('nano')(process.env.COUCH_URL || 'http://localhost:5984')
const { v4: uuid } = require('uuid')

const api = express.Router()
api.use(express.json())
const usersDB = nano.db.use('_users')

module.exports = api

/**
 * This is the server side implementation of the account and session API.
 * It is inspired by Hoodies API. https://github.com/hoodiehq/account-json-api
 * But it should be minimal and mostly use CouchDB's API.
 */

// sign up
api.put(
  '/account',
  body('data.type').equals('account'),
  body('data.id').optional().isUUID(),
  body('data.attributes.username').isEmail(),
  body('data.attributes.password').isLength({ min: 8 }),
  async (req, res) => {
    res.type('application/vnd.api+json')

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
api.get('/account', (req, res) => {
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
