import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { viewerName } from '../viewerInfo'

import { downloadAccountData, updateAccount, deleteAccount } from '../actions/viewerAccount'

import style from './accountDialog.module.css'
import formStyles from './formElements.module.css'

import { useFormInput, useAutoFocus } from '../hooks/utils'
import { getUserName } from '../selectors/viewer'

export default function AccountPanel () {
  const dispatch = useDispatch()
  const username = useSelector(getUserName)
  const [isUpdating, setIsUpdating] = useState(false)

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

  const onSubmit = async event => {
    event.preventDefault()

    const option = {}

    if (changedUsername.value !== username) {
      option.nextUsername = changedUsername.value
    }

    if (passwordRequired) {
      if (
        newPassword.value.length < 8 ||
        newPassword.value !== newPassword2.value ||
        oldPassword.value.length < 8
      ) {
        return
      }

      option.password = oldPassword
      option.nextPassword = newPassword
    }

    setIsUpdating(true)

    try {
      await dispatch(updateAccount(option))
      resetPw()
    } catch (err) {
      setError(err.toString())
    } finally {
      setIsUpdating(false)
    }
  }

  const doDeleteAccount = event => {
    event.preventDefault()

    const doIt = window.confirm(`
Do you want to delete your account for ${viewerName} and all your data?

This is permanent and can not be undone!`)

    if (doIt) {
      deleteAccount()
    }
  }

  const autoFocusRef = useAutoFocus()

  return <form className={style.Container} onSubmit={onSubmit}>
    <h3>Update your account</h3>
    <div className={formStyles.FormField}>
      <label htmlFor='usernameChange'>Username / Mail</label>
      <input
        {...changedUsername}
        id='usernameChange'
        type='email'
        className={formStyles.Input}
        disabled={isUpdating}
        autoFocus
        required
        ref={autoFocusRef}
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
          disabled={isUpdating}
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
          disabled={isUpdating}
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
          disabled={isUpdating}
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
        disabled={isUpdating || (!passwordRequired && changedUsername.value === username)}
      >
        update
      </button>

      <button
        type='reset'
        onClick={resetAll}
        className={formStyles.SecondaryButton}
        disabled={isUpdating}
      >
        reset
      </button>
    </div>

    <hr className={style.Separator} />

    <AccountDataDownload />

    <hr className={style.Separator} />

    <button
      type='button'
      className={formStyles.DangerButton}
      onClick={doDeleteAccount}
      disabled={isUpdating}
    >
      Delete your {viewerName} account
    </button>
  </form>
}

function AccountDataDownload () {
  const dispatch = useDispatch()

  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState(null)
  const data = useRef(null)

  useEffect(() => {
    return () => {
      if (data.current !== null) {
        URL.revokeObjectURL(data.current)
      }
    }
  }, [])

  const doStartDownload = async () => {
    try {
      setIsDownloading(true)
      setError(null)

      const result = await dispatch(downloadAccountData())

      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      zip.file('raw_data.json', JSON.stringify(result, null, 2) + '\n')

      const file = await zip.generateAsync({ type: 'blob' })
      data.current = URL.createObjectURL(file)
    } catch (err) {
      setError(err.toString())
    } finally {
      setIsDownloading(false)
    }
  }

  return <div className={style.ButtonRow}>
    <button
      type='button'
      className={formStyles.PrimaryButton}
      onClick={doStartDownload}
      disabled={isDownloading}
    >
      Prepare your data to download.
    </button>

    {error && <small className={formStyles.Error} role='alert'>
      {error}
    </small>}

    {data.current && <a
      href={data.current}
      target='_blank'
      rel='noopener noreferrer'
      className={formStyles.OkButton}
      download={`${viewerName}_user_data.zip`}
      role='alert'
    >
      Download your data.
    </a>}
  </div>
}
