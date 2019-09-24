import React, { useState } from 'react'
import { useSelector } from 'react-redux'

import Popup from './popup'
import formStyles from '../formElements.module.css'
import signInStyles from './signInPopup.module.css'

import { useAccount } from '../../hooks/hoodie'
import { useFormInput } from '../../hooks/utils'
import { getUserName } from '../../selectors/viewer'

export default function AccountPanel ({ onClose }) {
  const account = useAccount()
  const username = useSelector(getUserName)

  const [error, setError] = useState(null)

  const changedUsername = useFormInput(username)

  const oldPassword = useFormInput('')
  const newPassword = useFormInput('')
  const newPassword2 = useFormInput('')

  const passwordRequired = [oldPassword, newPassword, newPassword2].some(p => p.value.length > 0)

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
        .then(onClose)
        .catch(err => { setError(err.toString()) })
    } else {
      account.update({ username: changedUsername.value })
        .then(onClose)
        .catch(err => { setError(err.toString()) })
    }
  }

  return <Popup title='Account Infos' onClose={onClose}>
    <form className={signInStyles.Container} onSubmit={onSubmit}>
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
        <button
          type='reset'
          style={{ marginTop: '.2em' }}
          className={formStyles.DangerButton}
          onClick={event => {
            event.preventDefault()
            changedUsername.onChange(username)
          }}
          disabled={changedUsername.value === username}
          title='Reset username to current username.'
        >
          Reset username
        </button>
      </div>

      <fieldset>
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

      <div className={signInStyles.ButtonsContainer}>
        <button
          className={formStyles.OkButton}
          disabled={!passwordRequired && changedUsername.value === username}
        >
          update
        </button>

        <button type='button' onClick={onClose} className={formStyles.SecondaryButton}>
          cancel
        </button>
      </div>
    </form>
  </Popup>
}
