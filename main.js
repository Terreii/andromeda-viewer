'use strict';

/*
 * Entrypoint into the app on the client side
 *
 */

var viewerInfo = require('./js/viewerInfo');

document.title = viewerInfo.name;

document.getElementById('loginButton').disabled = false;
