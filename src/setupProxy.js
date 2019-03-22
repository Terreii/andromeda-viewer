'use strict'

const proxy = require('http-proxy-middleware')

module.exports = proxySetup

function proxySetup (app) {
  // Setup proxy for all http apis
  app.use(proxy('/hoodie', {
    target: 'http://localhost:8080',
    changeOrigin: true
  }))

  // Setup proxy for web-socket
  app.use(proxy('/andromeda-bridge', {
    target: 'http://localhost:8080',
    changeOrigin: true,
    ws: true
  }))
}
