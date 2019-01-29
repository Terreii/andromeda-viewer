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

const InputInGrid = styled.input`
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

const LabelInGrid = styled.label`
  margin-right: .3em;
  color: rgba(0, 0, 0, 0.87);
  font-weight: 700;
  font-size: 0.8em;
  line-height: 1.4em;
`

const ButtonsContainer = styled.div`
  flex: auto;
  display: flex;
  flex-direction: row;
  padding: 0 0.3em;
`

const ButtonsInGrid = styled.button`
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
    const title = this.props.isSignUp ? 'Sign up' : 'Sign in'

    return <Popup title={title} onClose={this.props.onCancel}>
      <Container className={this.props.isSignUp ? 'SignUp' : ''}>
        <FormElement show>
          <LabelInGrid htmlFor='userNameIn'>
            Username / eMail:
          </LabelInGrid>
          <InputInGrid
            id='userNameIn'
            type='email'
            value={this.state.username}
            data-key='username'
            autoComplete='email'
            onChange={this._boundInputChange}
            placeholder='me-avatar@example.com'
            autoFocus
            required
          />
        </FormElement>

        <FormElement show>
          <LabelInGrid htmlFor='password'>
            Password:
          </LabelInGrid>
          <InputInGrid
            id='password'
            type='password'
            value={this.state.password}
            data-key='password'
            autoComplete={this.props.isSignUp ? 'new-password' : 'current-password'}
            onChange={this._boundInputChange}
            required
          />
        </FormElement>

        <FormElement show={this.props.isSignUp}>
          <LabelInGrid htmlFor='password2'>
            Repeat password:
          </LabelInGrid>
          <InputInGrid
            id='password2'
            type='password'
            value={this.state.password2}
            data-key='password2'
            autoComplete='new-password'
            onChange={this._boundInputChange}
            required={this.props.isSignUp}
          />
        </FormElement>

        <FormElement show>
          <LabelInGrid htmlFor='cryptoPassword'>
            Encryption Password:
          </LabelInGrid>
          <InputInGrid
            id='cryptoPassword'
            type='password'
            value={this.state.cryptoPassword}
            data-key='cryptoPassword'
            onChange={this._boundInputChange}
            required
          />
        </FormElement>

        <FormElement show={this.props.isSignUp}>
          <LabelInGrid htmlFor='cryptoPassword2'>
            Repeat Encryption Password:
          </LabelInGrid>
          <InputInGrid
            id='cryptoPassword2'
            type='password'
            value={this.state.cryptoPassword2}
            data-key='cryptoPassword2'
            onChange={this._boundInputChange}
            required={this.props.isSignUp}
          />
        </FormElement>

        <ButtonsContainer>
          <ButtonsInGrid className='cancel' onClick={this.props.onCancel}>
            cancel
          </ButtonsInGrid>
          <ButtonsInGrid className='ok' onClick={this._boundSend}>
            {this.props.isSignUp ? 'sign up' : 'sign in'}
          </ButtonsInGrid>
        </ButtonsContainer>
      </Container>
    </Popup>
  }
}
