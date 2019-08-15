import React, { useState } from 'react'

import Popup from './popup'

import styles from './unlockAndSignOut.module.css'
import formStyles from '../formElements.module.css'

export default function ResetPasswordDialog ({ type, onChangePassword, onSignOut, onCancel }) {
  const isEncryption = type === 'encryption'

  const [resetKey, setResetKey] = useState('')
  const [password1, setPassword1] = useState('')
  const [password2, setPassword2] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [isChanging, setIsChanging] = useState(false)

  const canChange = !isChanging &&
    resetKey.length === 32 &&
    password1.length >= 8 &&
    password1 === password2

  return <Popup title='Reset password' onClose={onCancel}>
    <div className={formStyles.FormField}>
      <label htmlFor='oldInput'>{isEncryption ? 'Reset-key' : 'Password'}:</label>
      <input
        id='oldInput'
        type='text'
        className={formStyles.Input}
        value={resetKey}
        onChange={event => { setResetKey(event.target.value) }}
        autoFocus
        required
        disabled={isChanging}
      />
      <small id='helpOld' className={formStyles.Help}>Please enter one of your reset-keys</small>
      <small
        id='oldInputError'
        className={formStyles.Error}
        data-hide={errorMessage == null || errorMessage.length === 0}
        role='alert'
      >
        {errorMessage}
      </small>
    </div>

    <div className={formStyles.FormField}>
      <label htmlFor='newPassword'>New {isEncryption ? 'encryption ' : ''}Password</label>
      <input
        id='newPassword'
        type='password'
        className={formStyles.Input}
        value={password1}
        onChange={event => { setPassword1(event.target.value) }}
        required
        aria-describedby='newPasswordHelp'
        disabled={isChanging}
      />
      <small id='newPasswordHelp' className={formStyles.Help}>Minimal length: 8 characters!</small>
    </div>

    <div className={formStyles.FormField}>
      <label htmlFor='newPassword2'>Repeat new password</label>
      <input
        id='newPassword2'
        type='password'
        className={formStyles.Input}
        value={password2}
        onChange={event => { setPassword2(event.target.value) }}
        required
        aria-describedby='secondPwInputError'
        disabled={isChanging}
      />
      <small
        id='secondPwInputError'
        className={formStyles.Error}
        data-hide={password2.length === 0 || password1 === password2}
        role='alert'
      >
        Password doesn't match!
      </small>
    </div>

    <div className={styles.ButtonsRow}>
      <button className={formStyles.SecondaryButton} onClick={onCancel} disabled={isChanging}>
        cancel
      </button>
      <button className={formStyles.DangerButton} onClick={onSignOut} disabled={isChanging}>
        sign out
      </button>
    </div>
    <div className={styles.ButtonsRow}>
      <button
        className={formStyles.PrimaryButton}
        onClick={() => {
          if (canChange) {
            setIsChanging(true)
            setErrorMessage(null)

            onChangePassword(resetKey, password1)
              .catch(err => {
                setErrorMessage(err.reason || err.toString())
                setIsChanging(false)
              })
          }
        }}
        disabled={!canChange}
      >
        change {isEncryption ? 'encryption ' : ''}password
      </button>
    </div>
  </Popup>
}
