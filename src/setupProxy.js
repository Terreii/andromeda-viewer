'use strict'

const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = proxySetup

/**
 * Setup the proxy.
 * @param {import('express').Application} app  Express App.
 */
function proxySetup (app) {
  // Setup proxy for all http apis
  app.use(createProxyMiddleware('http://localhost:3001/hoodie/andromeda-viewer/proxy/', {
    changeOrigin: true,
    toProxy: true
  }))

  // Setup proxy for web-socket
  app.use(createProxyMiddleware('/api/bridge', {
    target: 'http://localhost:3001',
    changeOrigin: true,
    ws: true
  }))

  // Setup all http apis
  app.use(createProxyMiddleware('http://localhost:3001/api/'))
}
