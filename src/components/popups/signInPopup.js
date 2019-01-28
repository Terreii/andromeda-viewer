import React from 'react'
import styled from 'styled-components'

import Popup from './popup'

const Container = styled.form`
  display: flex;
  flex-direction: column;
  
  @supports (display: grid) {
    display: grid;
    grid-template-areas:
      "name nameIn nameIn"
      "pw pwIn pwIn"
      "crypto cryptoIn cryptoIn"
      "cancel ok ok";
    grid-gap: .3em;

    &.SignUp {
      grid-template-areas:
        "name nameIn nameIn"
        "pw pwIn pwIn"
        "pw2 pwIn2 pwIn2"
        "crypto cryptoIn cryptoIn"
        "crypto2 cryptoIn2 cryptoIn2"
        "cancel ok ok";
    }
  }
`

const InputInGrid = styled.input`
  grid-area: ${props => props.grid};
  display: ${props => props.show ? '' : 'none'};
`

const LabelInGrid = styled.label`
  grid-area: ${props => props.grid};
  display: ${props => props.show ? '' : 'none'};
`

const ButtonsInGrid = styled.button`
  grid-area: ${props => props.grid};
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
      <div>
        <Container className={this.props.isSignUp ? 'SignUp' : ''}>
          <LabelInGrid htmlFor='userNameIn' grid='name' show>
            Username / eMail
          </LabelInGrid>
          <InputInGrid
            id='userNameIn'
            grid='nameIn'
            show
            type='email'
            value={this.state.username}
            data-key='username'
            autoComplete='email'
            onChange={this._boundInputChange}
            placeholder='me-avatar@example.com'
            autoFocus
            required
          />

          <LabelInGrid htmlFor='password' grid='pw' show>
            Password
          </LabelInGrid>
          <InputInGrid
            id='password'
            grid='pwIn'
            show
            type='password'
            value={this.state.password}
            data-key='password'
            autoComplete={this.props.isSignUp ? 'new-password' : 'current-password'}
            onChange={this._boundInputChange}
            required
          />

          <LabelInGrid
            htmlFor='password2'
            grid='pw2'
            show={this.props.isSignUp}
          >
            Repeat password
          </LabelInGrid>
          <InputInGrid
            id='password2'
            grid='pwIn2'
            show={this.props.isSignUp}
            type='password'
            value={this.state.password2}
            data-key='password2'
            autoComplete='new-password'
            onChange={this._boundInputChange}
            required={this.props.isSignUp}
          />

          <LabelInGrid htmlFor='cryptoPassword' grid='crypto' show>
            Encryption Password
          </LabelInGrid>
          <InputInGrid
            id='cryptoPassword'
            grid='cryptoIn'
            show
            type='password'
            value={this.state.cryptoPassword}
            data-key='cryptoPassword'
            onChange={this._boundInputChange}
            required
          />

          <LabelInGrid
            htmlFor='cryptoPassword2'
            grid='crypto2'
            show={this.props.isSignUp}
          >
            Repeat Encryption Password
          </LabelInGrid>
          <InputInGrid
            id='cryptoPassword2'
            grid='cryptoIn2'
            show={this.props.isSignUp}
            type='password'
            value={this.state.cryptoPassword2}
            data-key='cryptoPassword2'
            onChange={this._boundInputChange}
            required={this.props.isSignUp}
          />

          <ButtonsInGrid onClick={this.props.onCancel} grid='cancel'>cancel</ButtonsInGrid>
          <ButtonsInGrid onClick={this._boundSend} grid='ok'>
            {this.props.isSignUp ? 'sign up' : 'sign in'}
          </ButtonsInGrid>
        </Container>
      </div>
    </Popup>
  }
}
