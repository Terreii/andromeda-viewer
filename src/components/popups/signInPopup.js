import React, { useState, useCallback } from 'react'

import Popup from './popup'

import styles from './signInPopup.module.css'
import formStyles from '../formElements.module.css'

export default function SignInPopup ({ isSignUp, onSend, onCancel }) {
  const [username, setUsername] = useState('')
  const [usernameValid, setUsernameValid] = useState(false)

  const password = useFormInput('')
  const password2 = useFormInput('')

  const cryptoPassword = useFormInput('')
  const cryptoPassword2 = useFormInput('')

  const [isSigningIn, setIsSigningIn] = useState(false)
  const [error, setError] = useState(null)

  const isValid = (() => {
    if ([password.value, cryptoPassword.value].some((s, i) => s.length < 8)) {
      return false
    }

    // this also checks length of password2 and cryptoPassword2
    if (isSignUp && (
      password.value !== password2.value || cryptoPassword.value !== cryptoPassword2.value
    )) {
      return false
    }

    return username.length > 4 && usernameValid
  })()

  const send = event => {
    event.preventDefault()
    if (!isValid) {
      return
    }

    setIsSigningIn(true)

    const type = isSignUp ? 'signUp' : 'signIn'
    onSend(username, password.value, cryptoPassword.value, type)
      .catch(err => {
        setIsSigningIn(false)
        setError(err.message || err.toString())
      })
  }

  const onKeyPress = event => {
    if (event.key === 'Enter') {
      send(event)
    }
  }

  return <Popup title={isSignUp ? 'Sign up' : 'Sign in'} onClose={onCancel}>
    <form className={styles.Container}>
      <div className={formStyles.FormField}>
        <label htmlFor='username'>
          Username / email:
        </label>
        <input
          id='username'
          type='email'
          className={formStyles.Input}
          autoComplete='email'
          value={username}
          onChange={event => {
            setUsername(event.target.value)
            setUsernameValid(event.target.validity.valid)
          }}
          onKeyPress={onKeyPress}
          placeholder='me-avatar@example.com'
          autoFocus
          required
          aria-describedby={isSignUp && 'mainHelp'}
          disabled={isSigningIn}
          onFocus={onFocusScrollIntoView}
        />
        {isSignUp && <small id='mainHelp' className={formStyles.Help}>
          Must be an email. We'll never share your email with anyone else.
        </small>}
      </div>

      <div className={formStyles.FormField}>
        <label htmlFor='password'>
          Password:
        </label>
        <input
          {...password}
          id='password'
          type='password'
          className={formStyles.Input}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          onKeyPress={onKeyPress}
          required
          minLength='8'
          aria-describedby={isSignUp && 'passwordHelp'}
          disabled={isSigningIn}
          onFocus={onFocusScrollIntoView}
        />
        {isSignUp && <small id='passwordHelp' className={formStyles.Help}>
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
        </small>}
      </div>

      {isSignUp && <div className={formStyles.FormField}>
        <label htmlFor='password2'>
          Repeat password:
        </label>
        <input
          {...password2}
          id='password2'
          type='password'
          className={formStyles.Input}
          autoComplete='new-password'
          onKeyPress={onKeyPress}
          required
          minLength='8'
          disabled={isSigningIn}
          onFocus={onFocusScrollIntoView}
        />
        <small
          className={formStyles.Error}
          data-hide={password2.value.length === 0 || password.value === password2.value}
          role='alert'
        >
          Password doesn't match!
        </small>
      </div>}

      <div className={formStyles.FormField}>
        <label htmlFor='cryptoPassword'>
          Encryption password:
        </label>
        <input
          {...cryptoPassword}
          id='cryptoPassword'
          type='password'
          className={formStyles.Input}
          onKeyPress={onKeyPress}
          required
          minLength='8'
          aria-describedby={isSignUp && 'cryptoPwHelp'}
          disabled={isSigningIn}
          onFocus={onFocusScrollIntoView}
        />
        {isSignUp && <small id='cryptoPwHelp' className={formStyles.Help}>
          Minimal length: 8 characters!<br />
          This password is used to encrypt your personal data.<br />
          This includes: <i>Avatar login-info</i>, <i>grids</i>, and <i>chat-logs</i>.<br />
          <b>Your personal data is encrypted on your machine.<br />
          and will never leave it un-encrypted!</b>
          <br />
          This password will <b>never</b> be saved or leave your machine!
        </small>}
      </div>

      {isSignUp && <div className={formStyles.FormField}>
        <label htmlFor='cryptoPassword2'>
          Repeat encryption password:
        </label>
        <input
          {...cryptoPassword2}
          id='cryptoPassword2'
          type='password'
          className={formStyles.Input}
          onKeyPress={onKeyPress}
          required
          minLength='8'
          disabled={isSigningIn}
          onFocus={onFocusScrollIntoView}
        />
        <small
          className={formStyles.Error}
          role='alert'
          data-hide={cryptoPassword2.length === 0 || cryptoPassword.value === cryptoPassword2.value}
        >
          Encryption password doesn't match!
        </small>
      </div>}

      {error && <small className={formStyles.Error} role='alert'>
        {error}
      </small>}

      <div className={styles.ButtonsContainer}>
        <button
          className={formStyles.SecondaryButton}
          onClick={onCancel}
          disabled={isSigningIn}
          onFocus={onFocusScrollIntoView}
        >
          cancel
        </button>
        <button
          className={formStyles.OkButton}
          onClick={send}
          disabled={!isValid || isSigningIn}
          onFocus={onFocusScrollIntoView}
        >
          {isSignUp ? 'sign up' : 'sign in'}
        </button>
      </div>
    </form>
  </Popup>
}

function onFocusScrollIntoView (event) {
  const target = event.target

  setTimeout(() => {
    if (target == null) return

    target.scrollIntoView({ block: 'center' })
  }, 16)
}

function useFormInput (initialValue) {
  const [value, setValue] = useState(initialValue)

  const eventHandler = useCallback(event => {
    const nextValue = typeof event === 'string'
      ? event
      : event.target.value
    setValue(nextValue)
  }, [setValue])

  return {
    value,
    onChange: eventHandler
  }
}
