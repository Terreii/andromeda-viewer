import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import Modal from './modal'

import { signIn, signUp } from '../../actions/viewerAccount'

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
      console.error(err)
      setIsSigningIn(false)
      setError(err.message || err.toString())
    }
  }

  return (
    <Modal title={isSignUp ? 'Sign up' : 'Sign in'} dialog={dialog} showOnClose showCloseButton>
      <form className='flex flex-col' onSubmit={send}>
        <label className='flex flex-col m-1'>
          <span>Username / email</span>
          <input
            id='username'
            type='email'
            className='block w-full mt-1 text-gray-900 form-input'
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
          {isSignUp && (
            <small id='mainHelp' className='leading-6 text-gray-600'>
              Must be an email. We'll never share your email with anyone else.
            </small>
          )}
        </label>

        <label className='flex flex-col m-1'>
          <span>Password</span>
          <input
            {...password}
            id='password'
            type='password'
            className='block w-full mt-1 text-gray-900 form-input'
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            required
            minLength='8'
            aria-describedby={isSignUp && 'passwordHelp'}
            disabled={isSigningIn}
            onFocus={onFocusScrollIntoView}
          />
          {isSignUp && (
            <small id='passwordHelp' className='leading-6 text-gray-600'>
              Please use a strong and unique password!<br />
              Minimal length: 8 characters!<br />
              {'A '}
              <a
                href='https://en.wikipedia.org/wiki/List_of_password_managers'
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 underline hover:text-blue-800 focus:text-blue-800'
              >
                Password Manager
              </a>
              {' is recommended.'}
            </small>
          )}
        </label>

        {isSignUp && (
          <label className='flex flex-col m-1'>
            <span>Repeat password</span>
            <input
              {...password2}
              id='password2'
              type='password'
              className='block w-full mt-1 text-gray-900 form-input'
              autoComplete='new-password'
              required
              minLength='8'
              disabled={isSigningIn}
              onFocus={onFocusScrollIntoView}
            />
            {!(password2.value.length === 0 || password.value === password2.value) && (
              <small
                className='px-4 py-2 mt-1 leading-6 text-red-800 bg-red-200 border border-red-500 rounded'
                role='alert'
              >
                Password doesn't match!
              </small>
            )}
          </label>
        )}

        <label className='flex flex-col m-1'>
          <span>Encryption password</span>
          <input
            {...cryptoPassword}
            id='cryptoPassword'
            type='password'
            className='block w-full mt-1 text-gray-900 form-input'
            required
            minLength='8'
            aria-describedby={isSignUp && 'cryptoPwHelp'}
            disabled={isSigningIn}
            onFocus={onFocusScrollIntoView}
          />
          {isSignUp && (
            <small id='cryptoPwHelp' className='leading-5 text-gray-600'>
              Minimal length: 8 characters!<br />
              This password is used to encrypt your personal data.<br />
              This includes: <i>Avatar login-info</i>, <i>grids</i>, and <i>chat-logs</i>.<br />
              <b>Your personal data is encrypted on your machine.<br />
              and will never leave it un-encrypted!
              </b>
              <br />
              This password will <b>never</b> be saved or leave your machine!
            </small>
          )}
        </label>

        {isSignUp && (
          <label className='flex flex-col m-1'>
            <span>Repeat encryption password</span>
            <input
              {...cryptoPassword2}
              id='cryptoPassword2'
              type='password'
              className='block w-full mt-1 text-gray-900 form-input'
              required
              minLength='8'
              disabled={isSigningIn}
              onFocus={onFocusScrollIntoView}
            />
            {!(cryptoPassword2.value.length === 0 ||
              cryptoPassword.value === cryptoPassword2.value
            ) && (
              <small
                className='px-4 py-2 mt-1 leading-6 text-red-800 bg-red-200 border border-red-500 rounded'
                role='alert'
              >
                Encryption password doesn't match!
              </small>
            )}
          </label>
        )}

        {error && (
          <small
            className='px-4 py-2 mt-1 leading-6 text-red-800 bg-red-200 border border-red-500 rounded'
            role='alert'
          >
            {error}
          </small>
        )}

        <div className='flex flex-row flex-auto px-1 py-0 mt-3 mb-1'>
          <button
            type='button'
            className='btn btn--secondary'
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
            className='ml-2 btn btn--ok'
            disabled={!isValid || isSigningIn}
            onFocus={onFocusScrollIntoView}
          >
            {isSignUp ? 'sign up' : 'sign in'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function onFocusScrollIntoView (event) {
  const target = event.target

  setTimeout(() => {
    if (target == null) return

    target.scrollIntoView({ block: 'center' })
  }, 16)
}
