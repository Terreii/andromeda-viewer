'use strict'

const bridge = require('./bridge')
const gridSession = require('./gridSession')
const proxy = require('./httpProxy')
const login = require('./login')

exports.register = function (server, options, next) {
  try {
    gridSession(server)
    login(server)
    bridge(server)
    proxy(server)
    next()
  } catch (err) {
    next(err)
  }
}

exports.register.attributes = {
  pkg: require('../package.json')
}
