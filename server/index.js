const express = require('express')
const webSocketBridge = require('./bridge')
const gridSession = require('./gridSession')

const app = express()

const port = process.env.PORT || 3001
app.set('host', process.env.HOST || `http://localhost:${port}`)

gridSession(app)

app.use(express.static(process.env.NODE_ENV === 'production' ? 'build' : 'public'))

app.use('/api/session', require('./account'))
app.use('/api/login', require('./login'))
app.use('/api/proxy', require('./httpProxy'))

const server = app.listen(port, () => console.log(`listening at http://localhost:${port}`))

webSocketBridge.createWebSocketServer(app, server, '/api/bridge')
