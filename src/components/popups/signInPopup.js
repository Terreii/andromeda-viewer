import React from 'react'
import styled from 'styled-components'

import Popup from './popup'

const Container = styled.form`
  display: flex;
  flex-direction: column;
  font-family: Helvetica, Arial, sans-serif;
`

const FormElement = styled.div`
  display: ${props => props.show ? 'flex' : 'none'};
  flex-direction: column;
  margin: .3em;
`

const Input = styled.input`
  padding: 0.45em 1em;
  border: 1px solid rgba(34, 36, 38, 0.15);
  border-radius: 0.3rem;
  font-size: 1rem;
  line-height: 1.2em;
  color: rgba(0, 0, 0, 0.87);

  &:focus {
    border-color: highlight;
  }
`

const Label = styled.label`
  margin-right: .3em;
  color: rgba(0, 0, 0, 0.87);
  font-weight: 700;
  font-size: 0.8em;
  line-height: 1.4em;
`

const Help = styled.small`
  color: #6c757d;
  line-height: 1.5;
  display: ${props => props.hide ? 'none' : ''};

  &.Error {
    color: #721c24;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 0.2em;
    padding: 0.50rem 1.00rem;
    margin-top: 0.25rem;
  }
`

const ButtonsContainer = styled.div`
  flex: auto;
  display: flex;
  flex-direction: row;
  margin-top: 0.3em;
  padding: 0 0.3em;
`

const Button = styled.button`
  flex: auto;
  margin-top: .5rem;
  padding: .5em;
  font-size: 1rem;
  border-radius: .25rem;
  border: 0px;
  font-weight: 400;
  font-family: Helvetica, Arial, sans-serif;

  & + & {
    margin-left: 0.55em;
  }

  &.cancel {
    color: white;
    background: #dc3545;

    &:hover, &:focus {
      background: #c82333;
    }
  }

  &.ok {
    color: white;
    background: #28a745;

    &:hover, &:focus {
      background: #218838;
    }
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
    const title = this.props.isSignUp ? 'Sign up' : 'Sign in'

    return <Popup title={title} onClose={this.props.onCancel}>
      <Container className={this.props.isSignUp ? 'SignUp' : ''}>
        <FormElement show>
          <Label htmlFor='username'>
            Username / email:
          </Label>
          <Input
            id='username'
            type='email'
            value={this.state.username}
            autoComplete='email'
            onChange={this._boundInputChange}
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
          <Label htmlFor='password'>
            Password:
          </Label>
          <Input
            id='password'
            type='password'
            value={this.state.password}
            autoComplete={this.props.isSignUp ? 'new-password' : 'current-password'}
            onChange={this._boundInputChange}
            required
            aria-describedby='passwordHelp'
          />
          <Help id='passwordHelp' hide={!this.props.isSignUp}>
            Please use a strong and unique password!<br />
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
          <Label htmlFor='password2'>
            Repeat password:
          </Label>
          <Input
            id='password2'
            type='password'
            value={this.state.password2}
            autoComplete='new-password'
            onChange={this._boundInputChange}
            required={this.props.isSignUp}
          />
          <Help
            className='Error'
            hide={this.state.password2.length === 0 || this.state.password === this.state.password2}
          >
            Password doesn't match!
          </Help>
        </FormElement>

        <FormElement show>
          <Label htmlFor='cryptoPassword'>
            Encryption password:
          </Label>
          <Input
            id='cryptoPassword'
            type='password'
            value={this.state.cryptoPassword}
            onChange={this._boundInputChange}
            required
            aria-describedby='cryptoPwHelp'
          />
          <Help id='cryptoPwHelp' hide={!this.props.isSignUp}>
            This password is used to encrypt your personal data.<br />
            This includes: <i>Avatar login-info</i>, <i>grids</i>, and <i>chat-logs</i>.<br />
            <b>Your personal data is encrypted on your machine.<br />
            and will never leave it un-encrypted!</b>
            <br />
            This password will <b>never</b> be saved or leave your machine!
          </Help>
        </FormElement>

        <FormElement show={this.props.isSignUp}>
          <Label htmlFor='cryptoPassword2'>
            Repeat encryption password:
          </Label>
          <Input
            id='cryptoPassword2'
            type='password'
            value={this.state.cryptoPassword2}
            onChange={this._boundInputChange}
            required={this.props.isSignUp}
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
          <Button className='cancel' onClick={this.props.onCancel}>
            cancel
          </Button>
          <Button className='ok' onClick={this._boundSend}>
            {this.props.isSignUp ? 'sign up' : 'sign in'}
          </Button>
        </ButtonsContainer>
      </Container>
    </Popup>
  }
}
