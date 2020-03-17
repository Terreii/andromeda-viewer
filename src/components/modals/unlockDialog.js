import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useDialogState, DialogDisclosure } from 'reakit'

import Modal from './modal'
import ResetPasswordDialog from './resetPasswordDialog'

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

  const resetPasswordState = useDialogState()

  const icon = (
    <img
      className={styles.LockItem}
      src={lockIcon}
      height='18'
      width='18'
      alt=''
    />
  )

  return (
    <Modal title='Unlock' icon={icon} dialog={dialog} backdrop notCloseable>
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
            <DialogDisclosure
              {...resetPasswordState}
              id='resetPasswordButton'
              className={styles.ResetButton}
            >
              Reset password
            </DialogDisclosure>
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
            disabled={isUnlocking || password.length < 8}
          >
            Unlock
          </button>
        </div>
      </form>

      <ResetPasswordDialog dialog={resetPasswordState} type='encryption' />
    </Modal>
  )
}
