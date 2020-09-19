'use strict'

const express = require('express')
const httpProxy = require('http-proxy')

const router = express.Router()

module.exports = router

const proxy = httpProxy.createProxyServer({})

proxy.on('proxyReq', (proxyReq, req, res, options) => {
  // Remove the internal session id
  proxyReq.setHeader('x-andromeda-session-id', '')
})

proxy.on('error', (err, req, res) => {
  res.statusCode = 500
  res.setHeader('content-type', 'application/json')
  res.write(JSON.stringify({
    errors: [{
      status: err.status || err.statusCode || 500,
      title: err.title || err.name,
      detail: err.detail || err.message
    }]
  }))
  res.end()
})

router.all('/:protocol/:hostname/:path(*$)', validateSession, (req, res) => {
  const { protocol, hostname, path } = req.params

  if (!protocol || !hostname) {
    res.sendStatus(404)
    return
  }

  const target = new URL(`${protocol}://${hostname}/${path || ''}`)
  proxy.web(req, res, {
    target: target.href,
    secure: false, // Self signed certificate of SL.
    xfwd: true,
    changeOrigin: true,
    followRedirects: true
  })
})

/**
 * Validate if the request is made by a logged in user.
 * @param {express.Request} req        Express Request Object.
 * @param {express.Response} res       Express Response Object.
 * @param {express.NextFunction} next  Call next middleware.
 */
function validateSession (req, res, next) {
  try {
    const sessionId = req.headers['x-andromeda-session-id']
    const checkSession = req.app.get('checkSession')
    checkSession(sessionId)
    next()
  } catch (err) {
    next(err)
  }
}
