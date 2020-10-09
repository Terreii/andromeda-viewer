'use strict'

const path = require('path')
const express = require('express')
const morgan = require('morgan')

const webSocketBridge = require('./bridge')
const gridSession = require('./gridSession')

const app = express()

const port = parseInt(process.env.PORT || 3001)
const publicDir = process.env.NODE_ENV === 'production' ? 'build' : 'public'

// Add logger
if (process.env.NODE_ENV !== 'test') { // but only if it is not a test
  const format = process.env.NODE_ENV === 'production'
    // like "common" but with an ISO-Date
    ? ':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length]'
    : 'dev'
  app.use(morgan(format))
}

gridSession(app)

app.use(express.static(publicDir))

app.use('/api/account', require('./account'))
app.post('/api/login', require('./login'))
app.use('/api/proxy', require('./httpProxy'))
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    next()
  } else {
    res.sendFile(path.join(process.cwd(), publicDir, 'index.html'))
  }
})

const server = app.listen(port, () => {
  if (!module.parent) {
    console.log(`listening at http://localhost:${port}`)
  }
})

webSocketBridge.createWebSocketServer(app, server, '/api/bridge')

exports.app = app
exports.server = server
