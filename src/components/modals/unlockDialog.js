import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useDialogState } from 'reakit'

import Modal from './modal'

import { showPasswordReset } from '../../bundles/account'
import { signOut, unlock } from '../../actions/viewerAccount'

import { useAutoFocus } from '../../hooks/utils'

import styles from './unlockAndSignOut.module.css'
import formStyles from '../formElements.module.css'
import lockIcon from '../../icons/black_lock.svg'

export default function UnlockDialog () {
  const dialog = useDialogState({ visible: process.env.NODE_ENV !== 'test' })
  const dispatch = useDispatch()

  const [password, setPassword] = useState('')
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [errorText, setErrorText] = useState(null)

  const doAutoFocus = useAutoFocus()

  const doUnlock = async event => {
    event.preventDefault()

    if (password.length === 0) {
      setErrorText('No password was entered jet!')
      return
    }

    setIsUnlocking(true)

    try {
      await dispatch(unlock(password))
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

  return <Modal title={title} dialog={dialog} backdrop>
    <form className={styles.Content} onSubmit={doUnlock}>
      <span>Please enter your <i>Encryption-Password</i> to unlock this app!</span>

      <div className={styles.PasswordRow}>
        <label htmlFor='unlockPasswordIn'>Password:</label>
        <input
          id='unlockPasswordIn'
          type='password'
          className={formStyles.Input}
          autoComplete='current-password'
          autoFocus
          ref={doAutoFocus}
          disabled={isUnlocking}
          value={password}
          onChange={event => { setPassword(event.target.value) }}
          aria-describedby='resetPassword'
        />
        <small id='resetPassword' className={formStyles.Help}>
          If you did forget your encryption-password?
          <button
            id='resetPasswordButton'
            type='button'
            className={styles.ResetButton}
            onClick={event => {
              event.preventDefault()
              dispatch(showPasswordReset('encryption'))
            }}
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
          id='signOutButton'
          type='button'
          className={formStyles.DangerButton}
          onClick={event => {
            event.preventDefault()
            dispatch(signOut())
          }}
          disabled={isUnlocking}
        >
          Sign out
        </button>

        <button
          id='unlockButton'
          className={formStyles.PrimaryButton}
          disabled={isUnlocking}
        >
          Unlock
        </button>
      </div>
    </form>
  </Modal>
}
