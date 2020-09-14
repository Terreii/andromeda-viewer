const express = require('express')
const createWebSocketBridge = require('./bridge')

const app = express()

const port = process.env.PORT || 3001
app.set('host', process.env.HOST || `http://localhost:${port}`)

app.use(createWebSocketBridge('/api/bridge'))

app.use(express.static(process.env.NODE_ENV === 'production' ? 'build' : 'public'))

app.use('/api/session', require('./account'))
app.use('/api/login', require('./login'))

app.listen(port, () => console.log(`listening at http://localhost:${port}`))
