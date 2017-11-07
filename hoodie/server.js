'use strict'

const bridge = require('./bridge')
const login = require('./login')
const proxy = require('./httpProxy')

exports.register = function (server, options, next) {
  try {
    login.init(server)
    bridge.init(server)
    proxy.init(server)
    next()
  } catch (err) {
    next(err)
  }
}

exports.register.attributes = {
  pkg: require('../package.json')
}
