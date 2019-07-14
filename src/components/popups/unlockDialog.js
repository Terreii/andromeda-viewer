import React, { useState } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import Popup from './popup'
import { Button, FormField, Input, Help } from '../formElements'

import lockIcon from '../../icons/black_lock.svg'

const Content = styled.div`
  display: flex;
  flex-direction: column;
`

const LockItemStyled = styled.img`
  position: relative;
  left: -10%;
  margin: 0px;
  margin-right: 0.3em;
`

const PasswordRow = styled(FormField)`
  margin-top: 0.75em;
`

const ButtonsRow = styled.div`
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  margin-top: .7em;
  padding: .25em 0em;

  & > button + button {
    margin-right: 2.75em;
  }
`

const ResetButton = styled.button`
  border: 0px;
  background: none;
  color: blue;
  text-decoration: underline;
  display: inline;
  padding: 0;
  padding-left: 1em;
  margin: 0;
  cursor: pointer;
`

export default function UnlockDialog ({ onUnlock, onSignOut, onForgottenPassword }) {
  const [password, setPassword] = useState('')
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [errorText, setErrorText] = useState(null)

  const unlock = async event => {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault()
    }

    if (password.length === 0) {
      setErrorText('No password was entered jet!')
      return
    }

    setIsUnlocking(true)

    try {
      await onUnlock(password)
    } catch (error) {
      console.error(error)
      const nextErrorText = typeof error.message === 'string'
        ? error.message
        : error.toString()

      setIsUnlocking(false)
      setErrorText(nextErrorText)
    }
  }

  const title = <span>
    <LockItemStyled
      src={lockIcon}
      height='18'
      width='18'
      alt=''
    />
    Unlock
  </span>

  return <Popup title={title}>
    <Content>
      <span>Please enter your <i>Encryption-Password</i> to unlock this app!</span>

      <PasswordRow>
        <label htmlFor='unlockPasswordIn'>Password:</label>
        <Input
          id='unlockPasswordIn'
          type='password'
          autoComplete='current-password'
          autoFocus
          disabled={isUnlocking}
          value={password}
          onChange={event => { setPassword(event.target.value) }}
          onKeyUp={event => {
            if (event.keyCode === 13) {
              unlock()
            }
          }}
          aria-describedby='resetPassword'
        />
        <Help id='resetPassword'>
          If you did forget your encryption-password?
          <ResetButton
            id='resetPasswordButton'
            onClick={() => { onForgottenPassword('encryption') }}
          >
            Reset password
          </ResetButton>
        </Help>
        <Help id='unlockError' className='Error' hide={errorText == null} role='alert'>
          {errorText}
        </Help>
      </PasswordRow>
      <ButtonsRow>
        <Button
          id='unlockButton'
          className='primary'
          onClick={unlock}
          disabled={isUnlocking}
        >
          Unlock
        </Button>
        <Button
          id='signOutButton'
          className='danger'
          onClick={onSignOut}
          disabled={isUnlocking}
        >
          Sign out
        </Button>
      </ButtonsRow>
    </Content>
  </Popup>
}

UnlockDialog.propTypes = {
  onUnlock: PropTypes.func.isRequired,
  onSignOut: PropTypes.func.isRequired,
  onForgottenPassword: PropTypes.func.isRequired
}
