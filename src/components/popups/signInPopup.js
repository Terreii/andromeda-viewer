import React, { useState, useCallback } from 'react'
import styled from 'styled-components'

import Popup from './popup'
import { Button, Input, FormField, Help } from '../formElements'

const Container = styled.form`
  display: flex;
  flex-direction: column;
  font-family: Helvetica, Arial, sans-serif;

  & > * {
    flex-shrink: 0;
  }
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
    <Container className={isSignUp ? 'SignUp' : ''}>
      <FormElement show>
        <label htmlFor='username'>
          Username / email:
        </label>
        <Input
          id='username'
          type='email'
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
          aria-describedby='mainHelp'
          disabled={isSigningIn}
          onFocus={onFocusScrollIntoView}
        />
        <Help id='mainHelp' hide={!isSignUp}>
          Must be an email. We'll never share your email with anyone else.
        </Help>
      </FormElement>

      <FormElement show>
        <label htmlFor='password'>
          Password:
        </label>
        <Input
          {...password}
          id='password'
          type='password'
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          onKeyPress={onKeyPress}
          required
          minLength='8'
          aria-describedby='passwordHelp'
          disabled={isSigningIn}
          onFocus={onFocusScrollIntoView}
        />
        <Help id='passwordHelp' hide={!isSignUp}>
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

      <FormElement show={isSignUp}>
        <label htmlFor='password2'>
          Repeat password:
        </label>
        <Input
          {...password2}
          id='password2'
          type='password'
          autoComplete='new-password'
          onKeyPress={onKeyPress}
          required={isSignUp}
          minLength='8'
          disabled={isSigningIn}
          onFocus={onFocusScrollIntoView}
        />
        <Help
          className='Error'
          hide={password2.value.length === 0 || password.value === password2.value}
          role='alert'
        >
          Password doesn't match!
        </Help>
      </FormElement>

      <FormElement show>
        <label htmlFor='cryptoPassword'>
          Encryption password:
        </label>
        <Input
          {...cryptoPassword}
          id='cryptoPassword'
          type='password'
          onKeyPress={onKeyPress}
          required
          minLength='8'
          aria-describedby='cryptoPwHelp'
          disabled={isSigningIn}
          onFocus={onFocusScrollIntoView}
        />
        <Help id='cryptoPwHelp' hide={!isSignUp}>
          Minimal length: 8 characters!<br />
          This password is used to encrypt your personal data.<br />
          This includes: <i>Avatar login-info</i>, <i>grids</i>, and <i>chat-logs</i>.<br />
          <b>Your personal data is encrypted on your machine.<br />
          and will never leave it un-encrypted!</b>
          <br />
          This password will <b>never</b> be saved or leave your machine!
        </Help>
      </FormElement>

      <FormElement show={isSignUp}>
        <label htmlFor='cryptoPassword2'>
          Repeat encryption password:
        </label>
        <Input
          {...cryptoPassword2}
          id='cryptoPassword2'
          type='password'
          onKeyPress={onKeyPress}
          required={isSignUp}
          minLength='8'
          disabled={isSigningIn}
          onFocus={onFocusScrollIntoView}
        />
        <Help
          className='Error'
          role='alert'
          hide={cryptoPassword2.length === 0 || cryptoPassword.value === cryptoPassword2.value}
        >
          Encryption password doesn't match!
        </Help>
      </FormElement>

      {error == null
        ? null
        : <Help className='Error' hide={error == null} role='alert'>
          {error}
        </Help>}

      <ButtonsContainer>
        <Button
          onClick={onCancel}
          disabled={isSigningIn}
          onFocus={onFocusScrollIntoView}
        >
          cancel
        </Button>
        <Button
          className='ok'
          onClick={send}
          disabled={!isValid || isSigningIn}
          onFocus={onFocusScrollIntoView}
        >
          {isSignUp ? 'sign up' : 'sign in'}
        </Button>
      </ButtonsContainer>
    </Container>
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
