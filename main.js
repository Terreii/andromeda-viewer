'use strict'

/*
 * Entrypoint into the app on the client side
 *
 */

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
const gridSelection = document.getElementById('gridSelection')
const newGridInput = document.getElementById('newGridInput')

// Login
function onLogin (event) {
  const loginName = nameInput.value
  const password = pwInput.value
  let gridName
  let gridLoginURL
  switch (gridSelection.value) {
    case 'second-life':
      gridName = 'Second Life'
      gridLoginURL = 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi'
      break
    case 'newGridByInput':
      gridName = document.getElementById('newGridName').value
      gridLoginURL = document.getElementById('newGridUrl').value
      if (gridName.length === 0 || gridLoginURL.length === 0) {
        displayLoginError('Please add a name and login URL for a openSIM Grid.')
        return
      }
      break
    default:
      window.alert('Add storing openSIM Grids.\nCan\'t login!')
      return
  }

  if (loginName.length === 0 || password.length === 0) {
    displayLoginError('Please insert a name and a password')
    return
  }

  button.disabled = true
  button.value = 'Connecting ...'

  const userName = new AvatarName(loginName)
  const grid = {
    name: gridName,
    url: gridLoginURL
  }

  login(userName.first, userName.last, password, grid, (err, sinfo) => {
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

function setNewGridInputVisibility (event) {
  newGridInput.style.display = gridSelection.value === 'newGridByInput'
    ? 'block'
    : ''
}
setNewGridInputVisibility()

button.addEventListener('click', onLogin)
nameInput.addEventListener('keyup', detectReturn)
pwInput.addEventListener('keyup', detectReturn)
gridSelection.addEventListener('change', setNewGridInputVisibility)

button.disabled = false
