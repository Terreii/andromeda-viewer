'use strict'

import React from 'react'

import AvatarName from '../avatarName'
import { viewerName } from '../viewerInfo'
import { login } from '../session'

import style from './login.css'

// Show the name of the Viewer
document.title = viewerName

export default class LoginForm extends React.Component {
  constructor () {
    super()
    this.state = {
      name: '',
      password: '',
      errorMessage: '',
      isLoggingIn: false
    }
    this._boundNameChange = this._nameChanged.bind(this)
    this._boundPasswordChange = this._passwordChanged.bind(this)
    this._boundLogin = this._login.bind(this)
    this._boundDetectReturn = this._detectReturn.bind(this)
  }

  _nameChanged (event) {
    const name = event.target.value || ''
    this.setState({
      name
    })
  }

  _passwordChanged (event) {
    const password = event.target.value || ''
    this.setState({
      password
    })
  }

  _detectReturn (event) { // detects if return was pressed (keyCode 13)
    if (event.type === 'keyup' && (
      event.which === 13 || event.keyCode === 13)
    ) {
      this._login(event)
    }
  }

  _login (event) {
    if (this.state.name.length === 0) {
      this.setState({
        errorMessage: 'Please enter a name'
      })
      return
    }
    if (this.state.password.length === 0) {
      this.setState({
        errorMessage: 'Please enter a password'
      })
      return
    }
    const userName = new AvatarName(this.state.name)
    login(userName.first, userName.last, this.state.password, (err, sinfo) => {
      if (err) {
        // Displays the error message from the server
        console.error(err)
        this.setState({
          errorMessage: err.message,
          isLoggingIn: false
        })
      } else {
        this.props.onLogin(true)
      }
    })
    this.setState({
      isLoggingIn: true
    })
  }

  render () {
    const displayError = this.state.errorMessage.length === 0
      ? 'none'
      : ''
    return <div className={style.Main}>
      <h1>
        {'Login to '}
        <span className={style.ViewerName}>
          {viewerName}
        </span>
      </h1>
      <div>
        <input
          type='text'
          id='loginName'
          placeholder='Avatar Name'
          autoComplete='username'
          value={this.state.name}
          onChange={this._boundNameChange}
          onKeyUp={this._boundDetectReturn}
          />
      </div>
      <div>
        <input
          type='password'
          id='loginPassword'
          placeholder='Password'
          autoComplete='current-password'
          value={this.state.password}
          onChange={this._boundPasswordChange}
          onKeyUp={this._boundDetectReturn}
          />
      </div>
      <div>
        <input
          type='button'
          value={this.state.isLoggingIn ? 'Connecting ...' : 'Login'}
          onClick={this._boundLogin}
          disabled={this.state.isLoggingIn}
          />
      </div>
      <p className={style.Error} style={{display: displayError}}>
        {this.state.errorMessage}
      </p>
    </div>
  }
}
