'use strict'

const nano = require('nano')(process.env.COUCH_URL || 'http://localhost:5984')

exports.nano = nano

exports.usersDB = nano.db.use('_users')
