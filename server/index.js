'use strict'

const path = require('path')
const express = require('express')
const webSocketBridge = require('./bridge')
const gridSession = require('./gridSession')

const app = express()

const port = parseInt(process.env.PORT || 3001)
const publicDir = process.env.NODE_ENV === 'production' ? 'build' : 'public'

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

module.exports = server
