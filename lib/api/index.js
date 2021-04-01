/* eslint-env node */
/* eslint-disable node/no-extraneous-require */
'use strict';
const express = require('express');
const expressPouchDB = require('express-pouchdb');
const PouchDB = require('pouchdb').defaults({
  prefix: 'db/',
});
const morgan = require('morgan');

module.exports = {
  name: require('./package').name,

  isDevelopingAddon() {
    return true;
  },

  serverMiddleware({ app }) {
    const api = express.Router();
    const logger = morgan('dev');
    api.use(logger);

    const webSocketBridge = require('../../backend/bridge');
    api.use(webSocketBridge.createWebSocketCreationRoute('/bridge'));

    const gridSession = require('../../backend/gridSession');
    gridSession(app);

    api.use('/account', require('../../backend/account'));
    api.post('/login', require('../../backend/login'));
    api.use('/proxy', require('../../backend/httpProxy'));

    app.use('/api', api);

    // Start the DB server.
    const dbApp = express();
    dbApp.use(expressPouchDB(PouchDB));
    dbApp.listen(5984);
  },
};
