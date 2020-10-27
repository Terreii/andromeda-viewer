module.exports = process.env.SERVER === 'debug'
  ? proxySetup
  : serverAndProxySetup

const { createProxyMiddleware } = require('http-proxy-middleware')
const morgan = require('morgan')

/**
 * Setup a server and proxy.
 * @param {import('express').Application} app  Express App.
 */
function serverAndProxySetup (app) {
  const logger = morgan('dev')

  const webSocketBridge = require('../server/bridge')
  app.use(webSocketBridge.createWebSocketCreationRoute('/api/bridge'))

  const gridSession = require('../server/gridSession')
  gridSession(app)

  app.use('/api/account', logger, require('../server/account'))
  app.post('/api/login', logger, require('../server/login'))
  app.use('/api/proxy', logger, require('../server/httpProxy'))
}

/**
 * Setup the proxy.
 * @param {import('express').Application} app  Express App.
 */
function proxySetup (app) {
  // Setup proxy for all http apis
  app.use(createProxyMiddleware('http://localhost:3001/api/proxy/', {
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
