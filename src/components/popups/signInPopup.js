import React from 'react'
import styled from 'styled-components'

import Popup from './popup'
import { Button, Input, FormField, Help } from '../formElements'

const Container = styled.form`
  display: flex;
  flex-direction: column;
  font-family: Helvetica, Arial, sans-serif;
`

const FormElement = styled(FormField)`
  display: ${props => props.show ? 'flex' : 'none'};
`

const ButtonsContainer = styled.div`
  flex: auto;
  display: flex;
  flex-direction: row;
  margin-top: 0.3em;
  padding: 0 0.3em;

  & > button {
    margin-top: .5rem;
  }

  & > button + button {
    margin-left: 0.55em;
  }
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
    this._boundKeyPress = this._onKeyPress.bind(this)
  }

  _inputChange (event) {
    const id = event.target.id
    const value = event.target.value
    this.setState({
      usernameValid: id === 'username' ? event.target.validity.valid : this.state.usernameValid,
      [id]: value
    })
  }

  _send (event) {
    if (!this._isInputValid()) {
      return
    }

    const type = this.props.isSignUp ? 'signUp' : 'signIn'
    this.props.onSend(this.state.username, this.state.password, this.state.cryptoPassword, type)
  }

  _isInputValid () {
    const username = this.state.username
    const password = this.state.password
    const password2 = this.state.password2
    const cryptoPassword = this.state.cryptoPassword
    const cryptoPassword2 = this.state.cryptoPassword2
    const isSignUp = this.props.isSignUp

    if ([password, cryptoPassword].some((s, i) => s.length < 8)) {
      return false
    }

    // this also checks length of password2 and cryptoPassword2
    if (isSignUp && (password !== password2 || cryptoPassword !== cryptoPassword2)) {
      return false
    }

    return username.length > 4 && this.state.usernameValid
  }

  _onKeyPress (event) {
    if (event.key === 'Enter') {
      event.preventDefault()

      this._send(event)
    }
  }

  render () {
    const title = this.props.isSignUp ? 'Sign up' : 'Sign in'

    return <Popup title={title} onClose={this.props.onCancel}>
      <Container className={this.props.isSignUp ? 'SignUp' : ''}>
        <FormElement show>
          <label htmlFor='username'>
            Username / email:
          </label>
          <Input
            id='username'
            type='email'
            value={this.state.username}
            autoComplete='email'
            onChange={this._boundInputChange}
            onKeyPress={this._boundKeyPress}
            placeholder='me-avatar@example.com'
            autoFocus
            required
            aria-describedby='mainHelp'
          />
          <Help id='mainHelp' hide={!this.props.isSignUp}>
            Must be an email. We'll never share your email with anyone else.
          </Help>
        </FormElement>

        <FormElement show>
          <label htmlFor='password'>
            Password:
          </label>
          <Input
            id='password'
            type='password'
            value={this.state.password}
            autoComplete={this.props.isSignUp ? 'new-password' : 'current-password'}
            onChange={this._boundInputChange}
            onKeyPress={this._boundKeyPress}
            required
            minLength='8'
            aria-describedby='passwordHelp'
          />
          <Help id='passwordHelp' hide={!this.props.isSignUp}>
            Please use a strong and unique password!<br />
            Minimal length: 8 characters!<br />
            {'A '}
            <a
              href='https://en.wikipedia.org/wiki/List_of_password_managers'
              target='_blank'
              rel='noopener noreferrer'
            >
              Password Manager
            </a>
            {' is recommended.'}
          </Help>
        </FormElement>

        <FormElement show={this.props.isSignUp}>
          <label htmlFor='password2'>
            Repeat password:
          </label>
          <Input
            id='password2'
            type='password'
            value={this.state.password2}
            autoComplete='new-password'
            onChange={this._boundInputChange}
            onKeyPress={this._boundKeyPress}
            required={this.props.isSignUp}
            minLength='8'
          />
          <Help
            className='Error'
            hide={this.state.password2.length === 0 || this.state.password === this.state.password2}
          >
            Password doesn't match!
          </Help>
        </FormElement>

        <FormElement show>
          <label htmlFor='cryptoPassword'>
            Encryption password:
          </label>
          <Input
            id='cryptoPassword'
            type='password'
            value={this.state.cryptoPassword}
            onChange={this._boundInputChange}
            onKeyPress={this._boundKeyPress}
            required
            minLength='8'
            aria-describedby='cryptoPwHelp'
          />
          <Help id='cryptoPwHelp' hide={!this.props.isSignUp}>
            Minimal length: 8 characters!<br />
            This password is used to encrypt your personal data.<br />
            This includes: <i>Avatar login-info</i>, <i>grids</i>, and <i>chat-logs</i>.<br />
            <b>Your personal data is encrypted on your machine.<br />
            and will never leave it un-encrypted!</b>
            <br />
            This password will <b>never</b> be saved or leave your machine!
          </Help>
        </FormElement>

        <FormElement show={this.props.isSignUp}>
          <label htmlFor='cryptoPassword2'>
            Repeat encryption password:
          </label>
          <Input
            id='cryptoPassword2'
            type='password'
            value={this.state.cryptoPassword2}
            onChange={this._boundInputChange}
            onKeyPress={this._boundKeyPress}
            required={this.props.isSignUp}
            minLength='8'
          />
          <Help
            className='Error'
            hide={this.state.cryptoPassword2.length === 0 ||
              this.state.cryptoPassword === this.state.cryptoPassword2
            }
          >
            Encryption password doesn't match!
          </Help>
        </FormElement>

        <ButtonsContainer>
          <Button onClick={this.props.onCancel}>
            cancel
          </Button>
          <Button className='ok' onClick={this._boundSend} disabled={!this._isInputValid()}>
            {this.props.isSignUp ? 'sign up' : 'sign in'}
          </Button>
        </ButtonsContainer>
      </Container>
    </Popup>
  }
}
