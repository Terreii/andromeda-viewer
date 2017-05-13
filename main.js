'use strict'

/*
 * Entrypoint into the app on the client side
 *
 */

import React from 'react'
import ReactDom from 'react-dom'

import LoginForm from './components/login'

/*
import {viewerName} from './viewerInfo'
import AvatarName from './avatarName'
import {login} from './session'
import display from './components/main'

function displayLoginError (message) {
  var messageDisplay = document.getElementById('loginErrorMessage')
  messageDisplay.textContent = message.toString()
  messageDisplay.style.display = 'block'
}

// Show the name of the Viewer
document.title = viewerName
document.getElementById('loginViewerName').textContent = viewerName

const button = document.getElementById('loginButton')
const nameInput = document.getElementById('loginName')
const pwInput = document.getElementById('loginPassword')

// Login
function onLogin (event) {
  const loginName = nameInput.value
  const password = pwInput.value

  if (loginName.length === 0 || password.length === 0) {
    displayLoginError('Please insert a name and a password')
    return
  }

  button.disabled = true
  button.value = 'Connecting ...'

  const userName = new AvatarName(loginName)

  login(userName.first, userName.last, password, (err, sinfo) => {
    if (err) {
      // Displays the error message from the server
      console.error(err)
      button.disabled = false
      button.value = 'Login'
      displayLoginError(err.message)
    } else {
      // cleanup
      button.removeEventListener('click', onLogin)
      nameInput.removeEventListener('keyup', detectReturn)
      pwInput.removeEventListener('keyup', detectReturn)

      // start everything
      display()
    }
  })
}

function detectReturn (event) { // detects if return was pressed (keyCode 13)
  if (event.type === 'keyup' && (event.which === 13 || event.keyCode === 13)) {
    onLogin(event)
  }
}

button.addEventListener('click', onLogin)
nameInput.addEventListener('keyup', detectReturn)
pwInput.addEventListener('keyup', detectReturn)

button.disabled = false
*/

ReactDom.render(<LoginForm />, document.getElementById('app'))
