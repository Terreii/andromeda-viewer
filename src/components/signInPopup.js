import React from 'react'
import styled from 'styled-components'

import Popup from './popup'

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
`

export default class SignInPopup extends React.Component {
  constructor () {
    super()
    this.state = {
      username: '',
      usernameValid: false,
      password: '',
      password2: '',
      cryptoPassword: '',
      cryptoPassword2: ''
    }
    this._boundInputChange = this._inputChange.bind(this)
    this._boundSend = this._send.bind(this)
  }

  _inputChange (event) {
    const key = event.target.dataset.key
    const value = event.target.value
    this.setState({
      usernameValid: key === 'username' ? event.target.validity.valid : this.state.usernameValid,
      [key]: value
    })
  }

  _send (event) {
    const username = this.state.username
    const password = this.state.password
    const cryptoPassword = this.state.cryptoPassword
    if (username.length === 0 || password.length === 0 || !this.state.usernameValid) {
      return
    }
    if (this.props.isSignUp && (
      password !== this.state.password2 ||
      cryptoPassword !== this.state.cryptoPassword2
    )) {
      return
    }
    const type = this.props.isSignUp ? 'signUp' : 'signIn'
    this.props.onSend(username, password, cryptoPassword, type)
  }

  render () {
    const title = this.props.isSignUp ? 'sign up' : 'sign in'
    return <Popup title={title} onClose={this.props.onCancel}>
      <div>
        <InputContainer>
          <input
            type='email'
            value={this.state.username}
            data-key='username'
            autoComplete='email'
            onChange={this._boundInputChange}
            placeholder='Username / eMail'
          />
          <input
            type='password'
            value={this.state.password}
            data-key='password'
            autoComplete={this.props.isSignUp ? 'new-password' : 'current-password'}
            onChange={this._boundInputChange}
            placeholder='Password'
          />
          <input
            style={{ display: this.props.isSignUp ? '' : 'none' }}
            type='password'
            value={this.state.password2}
            data-key='password2'
            autoComplete='new-password'
            onChange={this._boundInputChange}
            placeholder='repeat password'
          />
          <input
            type='password'
            value={this.state.cryptoPassword}
            data-key='cryptoPassword'
            onChange={this._boundInputChange}
            placeholder='set encryption password'
          />
          <input
            style={{ display: this.props.isSignUp ? '' : 'none' }}
            type='password'
            value={this.state.cryptoPassword2}
            data-key='cryptoPassword2'
            onChange={this._boundInputChange}
            placeholder='repeat encryption password'
          />
        </InputContainer>
        <div>
          <button onClick={this.props.onCancel}>cancel</button>
          <button onClick={this._boundSend}>
            {this.props.isSignUp ? 'sign up' : 'sign in'}
          </button>
        </div>
      </div>
    </Popup>
  }
}
