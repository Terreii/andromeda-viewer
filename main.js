'use strict'

/*
 * Entrypoint into the app on the client side
 *
 */

import {viewerName} from './viewerInfo'
import AvatarName from './avatarName'
import {login, isLoggedIn} from './session'
import {getAccounts, addAccount} from './stores/database'
import display from './components/main'

function displayLoginError (message) {
  var messageDisplay = document.getElementById('loginErrorMessage')
  messageDisplay.textContent = message.toString()
  messageDisplay.style.display = 'block'
}

// Show the name of the Viewer
;(() => {
  document.title = viewerName
  const viewerNameSpans = document.getElementsByClassName('loginViewerName')
  for (let i = 0; i < viewerNameSpans.length; ++i) {
    viewerNameSpans[i].textContent = viewerName
  }
})()

const button = document.getElementById('loginButton')
const nameInput = document.getElementById('loginName')
const pwInput = document.getElementById('loginPassword')

const signUpButton = document.getElementById('startSignUpButton')
const signInButton = document.getElementById('startSignInButton')
const signOutButton = document.getElementById('signOutButton')

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

      signInButton.removeEventListener('click', signInButtonPressed)
      signUpButton.removeEventListener('click', signUpButtonPressed)
      signOutButton.removeEventListener('click', signOutButtonPressed)

      addAccount(userName.getName(), '')

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

// Adds all Accounts to the accountNames-datalist
getAccounts().then(accounts => {
  if (isLoggedIn()) {
    return
  }
  const loginDiv = document.getElementById('accountNames')
  accounts.accounts.forEach(account => {
    const option = document.createElement('option')
    option.value = account.name
    loginDiv.appendChild(option)
  })
}).catch(err => {
  console.error(err)
})

// Hoodie Accont part

window.hoodie.account.get(['session', 'username']).then(properties => {
  const section = document.getElementById('loginViewerAccountSection')
  section.style.display = 'flex'
  if (properties.session) {
    setAccountLoginSectionDiplay(false, properties.username)
  } else {
    setAccountLoginSectionDiplay(true)
  }
})

function setAccountLoginSectionDiplay (showLogin, accountName) {
  const accountInfo = document.getElementById('loginViewerAccountInfo')
  const viewerAccountNameInput = document.getElementById('loginToViewerName')
  const viewerAccountPSInput = document.getElementById('loginToViewerPassword')
  const viewerAccountSignDiv = document.getElementById('viewerSignInButtons')
  if (showLogin) {
    accountInfo.style.display = 'none'
    viewerAccountNameInput.style.display = ''
    viewerAccountPSInput.style.display = ''
    viewerAccountSignDiv.style.display = ''
  } else {
    accountInfo.style.display = ''
    viewerAccountNameInput.style.display = 'none'
    viewerAccountPSInput.style.display = 'none'
    viewerAccountSignDiv.style.display = 'none'
    document.getElementById('loginViewerAccountInfoName')
      .textContent = accountName
    displaySavedAccounts()
  }
}

function displaySavedAccounts () {
  window.hoodie.store.findAll('accounts/').then(results => {
    console.log(results)
  }).catch(err => console.error(err))
}

function loginToViewer (username, password) {
  return window.hoodie.account.signIn({
    username,
    password
  }).then(accountProperties => {
    setAccountLoginSectionDiplay(false, accountProperties.username)
  })
}

function signUpButtonPressed (event) {
  const username = document.getElementById('loginToViewerName')
    .value
    .toLowerCase()
  const password = document.getElementById('loginToViewerPassword').value
  window.hoodie.account.signUp({
    username,
    password
  }).then(accountProperties => {
    return loginToViewer(username, password)
  }).catch(error => {
    displayLoginError(error.message)
  })
}

function signInButtonPressed (event) {
  const username = document.getElementById('loginToViewerName')
    .value
    .toLowerCase()
  const password = document.getElementById('loginToViewerPassword').value
  loginToViewer(username, password).catch(error => {
    displayLoginError(error.message)
  })
}

function signOutButtonPressed (event) {
  window.hoodie.account.signOut().then(sessionProperties => {
    setAccountLoginSectionDiplay(true)
  }).catch(error => console.error(error))
}

signInButton.addEventListener('click', signInButtonPressed)
signUpButton.addEventListener('click', signUpButtonPressed)
signOutButton.addEventListener('click', signOutButtonPressed)
