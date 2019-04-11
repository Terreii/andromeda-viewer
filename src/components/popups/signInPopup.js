import React from 'react'

import Popup from './popup'

import styles from './signInPopup.module.css'
import formStyles from '../formElements.module.css'

export default class SignInPopup extends React.Component {
  constructor () {
    super()
    this.state = {
      username: '',
      usernameValid: false,
      password: '',
      password2: '',
      cryptoPassword: '',
      cryptoPassword2: '',
      isSigningIn: false,
      error: null
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

  async _send (event) {
    event.preventDefault()
    if (!this._isInputValid()) {
      return
    }

    this.setState({
      isSigningIn: true
    })

    const type = this.props.isSignUp ? 'signUp' : 'signIn'
    try {
      await this.props.onSend(
        this.state.username,
        this.state.password,
        this.state.cryptoPassword,
        type
      )
    } catch (err) {
      this.setState({
        isSigningIn: false,
        error: err.message || err.toString()
      })
    }
  }

  _onFocus (event) {
    const target = event.target

    setTimeout(() => {
      if (target == null) return

      target.scrollIntoView({ block: 'center' })
    }, 16)
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
      <form className={styles.Container}>
        <div className={formStyles.FormField}>
          <label htmlFor='username'>
            Username / email:
          </label>
          <input
            id='username'
            type='email'
            className={formStyles.Input}
            value={this.state.username}
            autoComplete='email'
            onChange={this._boundInputChange}
            onKeyPress={this._boundKeyPress}
            placeholder='me-avatar@example.com'
            autoFocus
            required
            aria-describedby='mainHelp'
            disabled={this.state.isSigningIn}
            onFocus={this._onFocus}
          />
          <small id='mainHelp' className={formStyles.Help} data-hide={!this.props.isSignUp}>
            Must be an email. We'll never share your email with anyone else.
          </small>
        </div>

        <div className={formStyles.FormField}>
          <label htmlFor='password'>
            Password:
          </label>
          <input
            id='password'
            type='password'
            className={formStyles.Input}
            value={this.state.password}
            autoComplete={this.props.isSignUp ? 'new-password' : 'current-password'}
            onChange={this._boundInputChange}
            onKeyPress={this._boundKeyPress}
            required
            minLength='8'
            aria-describedby='passwordHelp'
            disabled={this.state.isSigningIn}
            onFocus={this._onFocus}
          />
          <small id='passwordHelp' className={formStyles.Help} data-hide={!this.props.isSignUp}>
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
          </small>
        </div>

        {this.props.isSignUp
          ? <div className={formStyles.FormField}>
            <label htmlFor='password2'>
              Repeat password:
            </label>
            <input
              id='password2'
              type='password'
              className={formStyles.Input}
              value={this.state.password2}
              autoComplete='new-password'
              onChange={this._boundInputChange}
              onKeyPress={this._boundKeyPress}
              required={this.props.isSignUp}
              minLength='8'
              disabled={this.state.isSigningIn}
              onFocus={this._onFocus}
            />
            <small
              className={formStyles.Error}
              data-hide={this.state.password2.length === 0 ||
                this.state.password === this.state.password2}
              role='alert'
            >
              Password doesn't match!
            </small>
          </div>
          : null}

        <div className={formStyles.FormField}>
          <label htmlFor='cryptoPassword'>
            Encryption password:
          </label>
          <input
            id='cryptoPassword'
            type='password'
            className={formStyles.Input}
            value={this.state.cryptoPassword}
            onChange={this._boundInputChange}
            onKeyPress={this._boundKeyPress}
            required
            minLength='8'
            aria-describedby='cryptoPwHelp'
            disabled={this.state.isSigningIn}
            onFocus={this._onFocus}
          />
          <small id='cryptoPwHelp' className={formStyles.Help} data-hide={!this.props.isSignUp}>
            Minimal length: 8 characters!<br />
            This password is used to encrypt your personal data.<br />
            This includes: <i>Avatar login-info</i>, <i>grids</i>, and <i>chat-logs</i>.<br />
            <b>Your personal data is encrypted on your machine.<br />
            and will never leave it un-encrypted!</b>
            <br />
            This password will <b>never</b> be saved or leave your machine!
          </small>
        </div>

        {this.props.isSignUp
          ? <div className={formStyles.FormField}>
            <label htmlFor='cryptoPassword2'>
              Repeat encryption password:
            </label>
            <input
              id='cryptoPassword2'
              type='password'
              className={formStyles.Input}
              value={this.state.cryptoPassword2}
              onChange={this._boundInputChange}
              onKeyPress={this._boundKeyPress}
              required={this.props.isSignUp}
              minLength='8'
              disabled={this.state.isSigningIn}
              onFocus={this._onFocus}
            />
            <small
              className={formStyles.Error}
              role='alert'
              data-hide={this.state.cryptoPassword2.length === 0 ||
                this.state.cryptoPassword === this.state.cryptoPassword2
              }
            >
              Encryption password doesn't match!
            </small>
          </div>
          : null}

        {this.state.error == null
          ? null
          : <small className={formStyles.Error} data-hide={this.state.error == null} role='alert'>
            {this.state.error}
          </small>}

        <div className={styles.ButtonsContainer}>
          <button
            className={formStyles.SecondaryButton}
            onClick={this.props.onCancel}
            disabled={this.state.isSigningIn}
            onFocus={this._onFocus}
          >
            cancel
          </button>
          <button
            className={formStyles.OkButton}
            onClick={this._boundSend}
            disabled={!this._isInputValid() || this.state.isSigningIn}
            onFocus={this._onFocus}
          >
            {this.props.isSignUp ? 'sign up' : 'sign in'}
          </button>
        </div>
      </form>
    </Popup>
  }
}
