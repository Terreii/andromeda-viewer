'use strict';

/*
 * Entrypoint into the app on the client side
 *
 */

var viewerInfo = require('./js/viewerInfo');
var parseFullName = require('./js/avatarName');
var session = require('./js/session');

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

  button.disabled = true;
  button.value = 'Connecting ...';

  var userName = parseFullName(loginName);

  session.login(userName.first, userName.last, password, function (err, sinfo) {
    if (err) {
      console.error(err);
      button.disabled = false;
      button.value = 'Login';
      displayLoginError(err.message);
    } else {
      var display = require('./js/ui/display.jsx');
      display();
    }
  });
});

button.disabled = false;
