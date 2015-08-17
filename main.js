'use strict';

/*
 * Entrypoint into the app on the client side
 *
 */

var viewerInfo = require('./js/viewerInfo');
var parseFullName = require('./js/avatarName');

function displayLoginError (message) {
  var messageDisplay = document.getElementById('loginErrorMessage');
  messageDisplay.textContent = message.toString();
  messageDisplay.style.display = 'block';
}

// Show the name of the Viewer
document.title = viewerInfo.name;
document.getElementById('loginViewerName').textContent = viewerInfo.name;

var button = document.getElementById('loginButton');

// Login
button.addEventListener('click', function (event) {
  var loginName = document.getElementById('loginName').value;
  var password = document.getElementById('loginPassword').value;

  if (loginName.length === 0 || password.length === 0) {
    displayLoginError('Please insert a name and a password');
    return;
  }

  var userName = parseFullName(loginName);
  console.log(userName);
});

button.disabled = false;
