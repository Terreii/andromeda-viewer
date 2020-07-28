const express = require('express')
const app = express()
const port = process.env.PORT || 3001

app.use(express.static(process.env.NODE_ENV === 'production' ? 'build' : 'public'))

app.listen(port, () => console.log(`listening at http://localhost:${port}`))
