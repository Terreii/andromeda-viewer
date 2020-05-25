import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { viewerName } from '../viewerInfo'

import { downloadAccountData, updateAccount, deleteAccount } from '../actions/viewerAccount'

import style from './accountDialog.module.css'
import formStyles from './formElements.module.css'

import { selectUserName } from '../bundles/account'
import { useFormInput, useAutoFocus } from '../hooks/utils'

export default function AccountPanel () {
  const dispatch = useDispatch()
  const username = useSelector(selectUserName)
  const [isUpdating, setIsUpdating] = useState(false)

  const { isValid: usernameIsValid, ...changedUsername } = useFormInput(username, true)

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

  const { isValid: oldPasswordIsValid, ...oldPassword } = useFormInput('', true)
  const { isValid: newPasswordIsValid, ...newPassword } = useFormInput('', true)
  const { isValid: newPassword2IsValid, ...newPassword2 } = useFormInput('', true)

  const passwordRequired = [oldPassword, newPassword, newPassword2].some(p => p.value.length > 0)
  const passwordsAreValid = oldPasswordIsValid && newPasswordIsValid && newPassword2IsValid &&
    newPassword.value === newPassword2.value && newPassword.value.length > 0

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

    if (
      (username !== changedUsername.value && !usernameIsValid) ||
      (changedUsername.value === username && !passwordRequired)
    ) {
      return
    }

    const option = {}

    if (changedUsername.value !== username) {
      option.nextUsername = changedUsername.value
    }

    if (passwordRequired) {
      if (!passwordsAreValid) {
        return
      }

      option.password = oldPassword.value
      option.nextPassword = newPassword.value
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

  return (
    <form className={style.Container} onSubmit={onSubmit}>
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
          <label htmlFor='passwordChangeOld'>Old password</label>
          <input
            {...oldPassword}
            id='passwordChangeOld'
            type='password'
            className={formStyles.Input}
            autoComplete='current-password'
            minLength='8'
            required={passwordRequired}
            disabled={isUpdating}
          />
        </div>

        <div className={formStyles.FormField}>
          <label htmlFor='passwordChangeNew'>New password</label>
          <input
            {...newPassword}
            id='passwordChangeNew'
            type='password'
            className={formStyles.Input}
            autoComplete='new-password'
            minLength='8'
            required={passwordRequired}
            aria-describedby='passwordHelp'
            disabled={isUpdating}
          />
          <small
            id='passwordHelp'
            className={formStyles.Error}
            data-hide={!passwordRequired || newPassword.value.length >= 8}
            role='alert'
          >
            A password must be 8 characters or longer!
          </small>
        </div>

        <div className={formStyles.FormField}>
          <label htmlFor='passwordChangeNew2'>Repeat password</label>
          <input
            {...newPassword2}
            id='passwordChangeNew2'
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
          id='updateAccountData'
          className={formStyles.OkButton}
          disabled={isUpdating ||
            (passwordRequired && !passwordsAreValid) || // password did change but not valid
            (changedUsername.value !== username && !usernameIsValid) || // username did change
            (changedUsername.value === username && !passwordRequired)} // nothing did change
        >
          update
        </button>

        <button
          type='reset'
          id='accountDataReset'
          onClick={resetAll}
          className='btn btn-secondary'
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
        className='btn btn-danger'
        onClick={doDeleteAccount}
        disabled={isUpdating}
      >
        Delete your {viewerName} account
      </button>
    </form>
  )
}

function AccountDataDownload () {
  const dispatch = useDispatch()

  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState(null)
  const [url, setUrl] = useState(null)

  useEffect(() => {
    return () => {
      if (url != null) {
        URL.revokeObjectURL(url)
      }
    }
  }, [url])

  const doStartDownload = async () => {
    try {
      setIsDownloading(true)
      setError(null)

      const { raw, files } = await dispatch(downloadAccountData())

      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      zip.file('raw_data.json', JSON.stringify(raw, null, 2) + '\n')

      files.forEach(file => {
        zip.file(file.name, file.data)
      })

      const file = await zip.generateAsync({ type: 'blob' })
      setUrl(URL.createObjectURL(file))
    } catch (err) {
      setError(err.toString())
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className={style.ButtonRow}>
      <button
        type='button'
        className='btn btn-primary'
        onClick={doStartDownload}
        disabled={isDownloading}
      >
        Prepare your data to download
      </button>

      {error && (
        <small className={formStyles.Error} role='alert'>
          {error}
        </small>
      )}

      {url && (
        <a
          href={url}
          target='_blank'
          rel='noopener noreferrer'
          className='btn btn-ok'
          download={`${viewerName}_user_data.zip`}
          role='alert'
        >
          Download your data
        </a>
      )}
    </div>
  )
}
