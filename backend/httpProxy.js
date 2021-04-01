/* eslint-env node */
'use strict';

const express = require('express');
const httpProxy = require('http-proxy');

const router = express.Router();

module.exports = router;

const proxy = httpProxy.createProxyServer({});

proxy.on('proxyReq', (proxyReq) => {
  // Remove the internal session id
  proxyReq.removeHeader('x-andromeda-session-id');
});

proxy.on('error', (err, _req, res) => {
  res.statusCode = 500;
  res.setHeader('content-type', 'application/json');
  res.write(
    JSON.stringify({
      errors: [
        {
          status: err.status || err.statusCode || 500,
          title: err.title || err.name,
          detail: err.detail || err.message,
        },
      ],
    })
  );
  res.end();
});

router.all('/:protocol/:hostname/:path(*$)', validateSession, (req, res) => {
  const { protocol, hostname, path } = req.params;

  if (!protocol || !hostname) {
    res.sendStatus(404);
    return;
  }

  const target = new URL(`${protocol}://${hostname}/${path || ''}`);
  proxy.web(req, res, {
    target: target.href,
    secure: false, // Self signed certificate of SL.
    xfwd: true,
    changeOrigin: true,
    followRedirects: true,
  });
});

// Error handler
// This transforms the different error styles into application/vnd.api+json errors.
router.use((err, _req, res, next) => {
  if (!err) {
    next();
    return;
  }
  res.type('application/vnd.api+json');

  const getStatus = (anError) =>
    Number(anError.status || anError.statusCode) || 500;
  const format = (anError) => ({
    status: getStatus(anError),
    title: anError.title || anError.name,
    detail: anError.reason || anError.detail || anError.message,
  });

  if (Array.isArray(err)) {
    res.status(getStatus(err[0]));
    res.json({
      errors: err.map(format),
    });
  } else {
    res.status(getStatus(err));
    res.json({
      errors: [format(err)],
    });
  }
});

/**
 * Validate if the request is made by a logged in user.
 * @param {express.Request} req        Express Request Object.
 * @param {express.Response} _res      Express Response Object.
 * @param {express.NextFunction} next  Call next middleware.
 */
function validateSession(req, _res, next) {
  try {
    const sessionId = req.headers['x-andromeda-session-id'];
    const checkSession = req.app.get('checkSession');
    checkSession(sessionId);
    next();
  } catch (err) {
    next(err);
  }
}
