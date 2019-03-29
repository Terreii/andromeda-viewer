import React, { useState } from 'react'
import styled from 'styled-components'

import Popup from './popup'
import { Button, FormField, Input, Help } from '../formElements'

const ButtonsRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: .7em;
  padding: .25em 0em;

  & > button + button {
    margin-left: 2.75em;
  }
`

export default function ResetPasswordDialog ({ type, onChangePassword, onSignOut, onCancel }) {
  const isEncryption = type === 'encryption'

  const [resetKey, setResetKey] = useState('')
  const [password1, setPassword1] = useState('')
  const [password2, setPassword2] = useState('')

  const canChange = resetKey.length === 32 && password1.length >= 8 && password1 === password2

  return <Popup title='Reset password' onClose={onCancel}>
    <FormField>
      <label htmlFor='oldInput'>{isEncryption ? 'Reset-key' : 'Password'}:</label>
      <Input
        id='oldInput'
        type='text'
        value={resetKey}
        onChange={event => { setResetKey(event.target.value) }}
        autoFocus
        required
      />
      <Help id='helpOld'>Please enter one of your reset-keys</Help>
    </FormField>

    <FormField>
      <label htmlFor='newPassword'>New {isEncryption ? 'encryption ' : ''}Password</label>
      <Input
        id='newPassword'
        type='password'
        value={password1}
        onChange={event => { setPassword1(event.target.value) }}
        required
        aria-describedby='newPasswordHelp'
      />
      <Help id='newPasswordHelp'>Minimal length: 8 characters!</Help>
    </FormField>

    <FormField>
      <label htmlFor='newPassword2'>Repeat new password</label>
      <Input
        id='newPassword2'
        type='password'
        value={password2}
        onChange={event => { setPassword2(event.target.value) }}
        required
        aria-describedby='secondPwInputError'
      />
      <Help
        id='secondPwInputError'
        className='Error'
        hide={password2.length === 0 || password1 === password2}
        role='alert'
      >
        Password doesn't match!
      </Help>
    </FormField>

    <ButtonsRow>
      <Button className='secondary' onClick={onCancel}>cancel</Button>
      <Button className='danger' onClick={onSignOut}>sign out</Button>
    </ButtonsRow>
    <ButtonsRow>
      <Button
        className='primary'
        onClick={() => {
          if (canChange) {
            onChangePassword(resetKey, password1)
          }
        }}
        disabled={!canChange}
      >
        change {isEncryption ? 'encryption ' : ''}password
      </Button>
    </ButtonsRow>
  </Popup>
}
