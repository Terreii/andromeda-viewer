'use strict'

const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = proxySetup

function proxySetup (app) {
  // Setup proxy for all http apis
  app.use(createProxyMiddleware('/hoodie', {
    target: 'http://localhost:8080',
    changeOrigin: true
  }))

  // Setup proxy for web-socket
  app.use(createProxyMiddleware('/andromeda-bridge', {
    target: 'http://localhost:8080',
    changeOrigin: true,
    ws: true
  }))
}
