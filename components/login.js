'use strict'

import React from 'react'

import {viewerName} from '../viewerInfo'

import style from './login.css'

document.title = viewerName

export default class LoginForm extends React.Component {
  constructor () {
    super()
    this.state = {
      name: '',
      password: '',
      errorMessage: ''
    }
    this._boundNameChange = this._nameChanged.bind(this)
    this._boundPasswordChange = this._passwordChanged.bind(this)
    this._boundLogin = this._login.bind(this)
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
    window.alert('login in')
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
          />
      </div>
      <div>
        <input type='button' value='Login' onClick={this._boundLogin} />
      </div>
      <p className={style.Error} style={{display: displayError}}>
        {this.state.errorMessage}
      </p>
    </div>
  }
}
