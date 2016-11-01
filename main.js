'use strict'

/*
 * Entrypoint into the app on the client side
 *
 */

import {viewerName} from './viewerInfo'
import AvatarName from './avatarName'
var session = require('./session')

function displayLoginError (message) {
  var messageDisplay = document.getElementById('loginErrorMessage')
  messageDisplay.textContent = message.toString()
  messageDisplay.style.display = 'block'
}

// Show the name of the Viewer
document.title = viewerName
document.getElementById('loginViewerName').textContent = viewerName

var button = document.getElementById('loginButton')
var nameInput = document.getElementById('loginName')
var pwInput = document.getElementById('loginPassword')

// Login
function login (event) {
  var loginName = nameInput.value
  var password = pwInput.value

  if (loginName.length === 0 || password.length === 0) {
    displayLoginError('Please insert a name and a password')
    return
  }

  button.disabled = true
  button.value = 'Connecting ...'

  var userName = new AvatarName(loginName)

  session.login(userName.first, userName.last, password, function (err, sinfo) {
    if (err) {
      // Displays the error message from the server
      console.error(err)
      button.disabled = false
      button.value = 'Login'
      displayLoginError(err.message)
    } else {
      // cleanup
      button.removeEventListener('click', login)
      nameInput.removeEventListener('keyup', detectReturn)
      pwInput.removeEventListener('keyup', detectReturn)

      // start everything
      var display = require('./components/main')
      display()
    }
  })
}

function detectReturn (event) { // detects if return was pressed (keyCode 13)
  if (event.type === 'keyup' && (event.which === 13 || event.keyCode === 13)) {
    login(event)
  }
}

button.addEventListener('click', login)
nameInput.addEventListener('keyup', detectReturn)
pwInput.addEventListener('keyup', detectReturn)

button.disabled = false
