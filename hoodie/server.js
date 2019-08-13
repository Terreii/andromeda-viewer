'use strict'

const bridge = require('./bridge')
const login = require('./login')
const proxy = require('./httpProxy')

exports.register = function (server, options, next) {
  try {
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
