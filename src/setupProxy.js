'use strict'

const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = proxySetup

function proxySetup (app) {
  // Setup proxy for all http apis
  app.use(createProxyMiddleware('http://localhost:3001/hoodie/andromeda-viewer/proxy/', {
    changeOrigin: true,
    toProxy: true
  }))

  // Setup all http apis
  app.use(createProxyMiddleware('http://localhost:3001/session'))

  // Setup proxy for web-socket
  app.use(createProxyMiddleware('/andromeda-bridge', {
    target: 'http://localhost:3001',
    changeOrigin: true,
    ws: true
  }))
}
