import React, { useState } from 'react'

import Popup from './popup'

import styles from './unlockAndSignOut.module.css'
import formStyles from '../formElements.module.css'
import lockIcon from '../../icons/black_lock.svg'

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
    <img
      className={styles.LockItem}
      src={lockIcon}
      height='18'
      width='18'
      alt=''
    />
    Unlock
  </span>

  return <Popup title={title}>
    <form className={styles.Content}>
      <span>Please enter your <i>Encryption-Password</i> to unlock this app!</span>

      <div className={styles.PasswordRow}>
        <label htmlFor='unlockPasswordIn'>Password:</label>
        <input
          id='unlockPasswordIn'
          type='password'
          className={formStyles.Input}
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
        <small id='resetPassword' className={formStyles.Help}>
          If you did forget your encryption-password?
          <button
            id='resetPasswordButton'
            className={styles.ResetButton}
            onClick={() => { onForgottenPassword('encryption') }}
          >
            Reset password
          </button>
        </small>
        <small
          id='unlockError'
          className={formStyles.Error}
          data-hide={errorText == null}
          role='alert'
        >
          {errorText}
        </small>
      </div>
      <div className={styles.ButtonsRow}>
        <button
          id='unlockButton'
          className={formStyles.PrimaryButton}
          onClick={unlock}
          disabled={isUnlocking}
        >
          Unlock
        </button>
        <button
          id='signOutButton'
          className={formStyles.DangerButton}
          onClick={onSignOut}
          disabled={isUnlocking}
        >
          Sign out
        </button>
      </div>
    </form>
  </Popup>
}
