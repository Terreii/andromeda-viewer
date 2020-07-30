const express = require('express')
const app = express()

const port = process.env.PORT || 3001
app.set('host', process.env.HOST || `http://localhost:${port}`)

app.use(express.static(process.env.NODE_ENV === 'production' ? 'build' : 'public'))

app.use('/session', require('./account'))

app.listen(port, () => console.log(`listening at http://localhost:${port}`))
