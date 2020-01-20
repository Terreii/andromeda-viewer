import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import Modal from './modal'

import { signIn, signUp } from '../../actions/viewerAccount'

import styles from './signIn.module.css'
import formStyles from '../formElements.module.css'

import { useFormInput } from '../../hooks/utils'

export default function SignInPopup ({ isSignUp, dialog }) {
  const dispatch = useDispatch()

  const [username, setUsername] = useState('')
  const [usernameValid, setUsernameValid] = useState(false)

  const password = useFormInput('')
  const password2 = useFormInput('')

  const cryptoPassword = useFormInput('')
  const cryptoPassword2 = useFormInput('')

  const [isSigningIn, setIsSigningIn] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    password.onChange('')
    password2.onChange('')

    cryptoPassword.onChange('')
    cryptoPassword2.onChange('')
    // Only reset passwords if the visibility did change
    // eslint-disable-next-line
  }, [dialog.visible])

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

  const send = async event => {
    event.preventDefault()
    if (!isValid) {
      return
    }

    setIsSigningIn(true)

    try {
      if (isSignUp) {
        await dispatch(signUp(username, password.value, cryptoPassword.value))
      } else {
        await dispatch(signIn(username, password.value, cryptoPassword.value))
      }
    } catch (err) {
      setIsSigningIn(false)
      setError(err.message || err.toString())
    }
  }

  return <Modal title={isSignUp ? 'Sign up' : 'Sign in'} dialog={dialog} showOnClose backdrop>
    <form className={styles.Container} onSubmit={send}>
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
          type='button'
          className={formStyles.SecondaryButton}
          onClick={event => {
            event.preventDefault()
            dialog.hide()
          }}
          disabled={isSigningIn}
          onFocus={onFocusScrollIntoView}
        >
          cancel
        </button>
        <button
          className={formStyles.OkButton}
          disabled={!isValid || isSigningIn}
          onFocus={onFocusScrollIntoView}
        >
          {isSignUp ? 'sign up' : 'sign in'}
        </button>
      </div>
    </form>
  </Modal>
}

function onFocusScrollIntoView (event) {
  const target = event.target

  setTimeout(() => {
    if (target == null) return

    target.scrollIntoView({ block: 'center' })
  }, 16)
}
