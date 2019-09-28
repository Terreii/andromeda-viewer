import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import style from './accountDialog.module.css'
import formStyles from './formElements.module.css'

import { useAccount } from '../hooks/hoodie'
import { useFormInput } from '../hooks/utils'
import { getUserName } from '../selectors/viewer'

export default function AccountPanel () {
  const account = useAccount()
  const username = useSelector(getUserName)

  const changedUsername = useFormInput(username)

  // for reset
  const usernameRef = useRef(username)
  useEffect(() => {
    if (usernameRef.current !== username) {
      if (usernameRef.current === changedUsername.value) {
        changedUsername.onChange(username)
      }
      usernameRef.current = username
    }
  }, [username, changedUsername])

  const [error, setError] = useState(null)

  const oldPassword = useFormInput('')
  const newPassword = useFormInput('')
  const newPassword2 = useFormInput('')

  const passwordRequired = [oldPassword, newPassword, newPassword2].some(p => p.value.length > 0)

  const resetPw = () => {
    oldPassword.onChange('')
    newPassword.onChange('')
    newPassword2.onChange('')
  }

  const resetAll = event => {
    if (event && event.preventDefault) {
      event.preventDefault()
    }

    changedUsername.onChange(username)
    resetPw()
  }

  const onSubmit = event => {
    event.preventDefault()

    if (passwordRequired) {
      if (
        newPassword.value.length < 8 ||
        newPassword.value !== newPassword2.value ||
        oldPassword.value.length < 8
      ) {
        return
      }

      account.signIn({
        username,
        password: oldPassword.value
      })
        .then(properties => {
          return account.update({
            username: changedUsername.value,
            password: newPassword.value
          })
        })
        .then(() => { resetPw() })
        .catch(err => { setError(err.toString()) })
    } else {
      account.update({ username: changedUsername.value })
        .catch(err => { setError(err.toString()) })
    }
  }

  return <form className={style.Container} onSubmit={onSubmit}>
    <h3>Update your account</h3>
    <div className={formStyles.FormField}>
      <label htmlFor='usernameChange'>Username</label>
      <input
        {...changedUsername}
        id='usernameChange'
        type='email'
        className={formStyles.Input}
        autoFocus
        required
      />
    </div>

    <fieldset className={style.FieldSet}>
      <legend>Change your password</legend>

      <small className={formStyles.Help}>
        If you leave them blank, we won't modify the password.
      </small>

      <div className={formStyles.FormField}>
        <label htmlFor='passwordChange'>Old password</label>
        <input
          {...oldPassword}
          id='passwordChange'
          type='password'
          className={formStyles.Input}
          autoComplete='current-password'
          minLength='8'
          required={passwordRequired}
        />
      </div>

      <div className={formStyles.FormField}>
        <label htmlFor='passwordChange'>New password</label>
        <input
          {...newPassword}
          id='passwordChange'
          type='password'
          className={formStyles.Input}
          autoComplete='new-password'
          minLength='8'
          required={passwordRequired}
          aria-describedby='passwordHelp'
        />
        <small
          id='password2Help'
          className={formStyles.Error}
          data-hide={!passwordRequired || newPassword.value.length >= 8}
          role='alert'
        >
          A password must be 8 characters or longer!
        </small>
      </div>

      <div className={formStyles.FormField}>
        <label htmlFor='passwordChange'>Repeat password</label>
        <input
          {...newPassword2}
          id='passwordChange'
          type='password'
          className={formStyles.Input}
          autoComplete='new-password'
          minLength='8'
          required={passwordRequired}
          aria-describedby='password2Help'
        />
        <small
          id='password2Help'
          className={formStyles.Error}
          data-hide={!passwordRequired || newPassword.value === newPassword2.value}
          role='alert'
        >
          Password doesn't match!
        </small>
      </div>
    </fieldset>

    {error && <p className={formStyles.Error} role='alert'>{error}</p>}

    <div className={style.ButtonRow}>
      <button
        className={formStyles.OkButton}
        disabled={!passwordRequired && changedUsername.value === username}
      >
        update
      </button>

      <button type='reset' onClick={resetAll} className={formStyles.SecondaryButton}>
        reset
      </button>
    </div>
  </form>
}
