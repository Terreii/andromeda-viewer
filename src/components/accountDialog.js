import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useDialogState, DialogDisclosure } from 'reakit'

import { viewerName } from '../viewerInfo'

import { downloadAccountData, updateAccount, deleteAccount } from '../actions/viewerAccount'

import { selectUserName } from '../bundles/account'
import Modal from './modals/modal'
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

  const passwordRequired = [newPassword, newPassword2].some(p => p.value.length > 0)
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
      !oldPasswordIsValid || oldPassword.value.length === 0 ||
      (username !== changedUsername.value && !usernameIsValid) ||
      (changedUsername.value === username && !passwordRequired)
    ) {
      return
    }

    const option = {
      password: oldPassword.value
    }

    if (changedUsername.value !== username) {
      option.nextUsername = changedUsername.value
    }

    if (passwordRequired) {
      if (!passwordsAreValid) {
        return
      }
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

  const autoFocusRef = useAutoFocus()

  return (
    <form className='w-64 mx-auto mt-16 mb-4 sm:w-1/2 lg:w-1/3' onSubmit={onSubmit}>
      <h3 className='text-2xl font-bold'>Update your account</h3>

      <label className='flex flex-col mt-3'>
        <span>Username / Mail</span>
        <input
          {...changedUsername}
          id='usernameChange'
          type='email'
          className='block w-full mt-1 text-gray-900 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
          disabled={isUpdating}
          autoFocus
          required
          ref={autoFocusRef}
        />
      </label>

      <label className='flex flex-col mx-1 mt-3 mb-1'>
        <span>Current password</span>
        <input
          {...oldPassword}
          id='passwordChangeOld'
          type='password'
          className='block w-full mt-1 text-gray-900 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
          autoComplete='current-password'
          minLength='8'
          required={username !== changedUsername.value || passwordRequired}
          disabled={isUpdating}
        />
      </label>

      <fieldset className='p-2 mt-4 border rounded focus-within:shadow-lg'>
        <legend className='mx-1'>Change your password</legend>

        <small className='mx-1 leading-6 text-gray-600'>
          If you leave them blank, we won't modify the password.
        </small>

        <label className='flex flex-col m-1'>
          <span>New password</span>
          <input
            {...newPassword}
            id='passwordChangeNew'
            type='password'
            className='block w-full mt-1 text-gray-900 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
            autoComplete='new-password'
            minLength='8'
            required={passwordRequired}
            aria-describedby='passwordHelp'
            disabled={isUpdating}
          />
          {passwordRequired && newPassword.value.length > 0 && newPassword.value.length < 8 && (
            <small
              id='passwordHelp'
              className='px-4 py-2 mt-1 leading-6 text-red-800 bg-red-200 border border-red-500 rounded'
              role='alert'
            >
              A password must be 8 characters or longer!
            </small>
          )}
        </label>

        <label className='flex flex-col m-1'>
          <span>Repeat password</span>
          <input
            {...newPassword2}
            id='passwordChangeNew2'
            type='password'
            className='block w-full mt-1 text-gray-900 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
            autoComplete='new-password'
            minLength='8'
            required={passwordRequired}
            aria-describedby='password2Help'
            disabled={isUpdating}
          />
          {passwordRequired &&
          newPassword2.value.length > 0 &&
          newPassword.value !== newPassword2.value && (
            <small
              id='password2Help'
              className='px-4 py-2 mt-1 leading-6 text-red-800 bg-red-200 border border-red-500 rounded'
              role='alert'
            >
              Password doesn't match!
            </small>
          )}
        </label>
      </fieldset>

      {error && (
        <p
          className='px-4 py-2 mt-1 leading-6 text-red-800 bg-red-200 border border-red-500 rounded'
          role='alert'
        >
          {error}
        </p>
      )}

      <div className='flex flex-col items-start mt-3 sm:flex-row'>
        <button
          id='updateAccountData'
          className='btn btn--ok'
          disabled={isUpdating ||
            (!oldPasswordIsValid || oldPassword.value.length === 0) ||
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
          className='mt-2 btn btn--secondary sm:ml-2 sm:mt-0'
          disabled={isUpdating}
        >
          reset
        </button>
      </div>

      <hr className='mt-3' />

      <AccountDataDownload />

      <hr className='my-3' />

      <DeleteAccountModal />
    </form>
  )
}

function AccountDataDownload () {
  const dispatch = useDispatch()
  const modalState = useDialogState()

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
      modalState.show()
    } catch (err) {
      setError(err.toString())
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className='mt-3'>
      <h4 className='text-lg font-semibold'>Download your data</h4>

      <p className='my-1'>
        Click the button to download your data in both a Andromeda Viewer format and
        Linden Lab's Viewer format.
      </p>

      <button
        type='button'
        className='btn btn--primary'
        onClick={doStartDownload}
        disabled={isDownloading}
      >
        Prepare your data to download
      </button>

      {error && (
        <small
          className='px-4 py-2 mt-1 leading-6 text-red-800 bg-red-200 border border-red-500 rounded'
          role='alert'
        >
          {error}
        </small>
      )}

      <Modal title='Download your data' dialog={modalState} showCloseButton>
        <p>Now click this button to download your data:</p>

        <div className='flex flex-col justify-end p-1 mx-auto sm:mr-0 sm:flex-row'>
          <a
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            className='mx-auto mt-3 btn btn--ok'
            download={`${viewerName}_user_data.zip`}
            role='alert'
          >
            Download your data
          </a>

          <button
            type='button'
            className='mt-3 sm:ml-4 btn btn--secondary'
            onClick={() => {
              modalState.hide()
            }}
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  )
}

function DeleteAccountModal () {
  const dispatch = useDispatch()
  const modalState = useDialogState()

  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const doDeleteAccount = async event => {
    event.preventDefault()

    if (password.length < 8) return

    try {
      await dispatch(deleteAccount(password))
    } catch (err) {
      setError(err)
    }
  }

  return (
    <>
      <DialogDisclosure {...modalState} className='btn btn--danger'>
        Delete your {viewerName} account
      </DialogDisclosure>

      <Modal title='Delete your account' dialog={modalState} showCloseButton>
        <form className='flex flex-col' onSubmit={doDeleteAccount}>
          <p className='m-1'>Please enter your password to delete your account.</p>

          <p className='m-1 font-bold'>This is permanent and can not be undone!</p>

          <label className='flex flex-col m-1 mt-2'>
            <span>Password</span>

            <input
              type='password'
              className='block w-full mt-1 text-gray-900 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
              value={password}
              onChange={event => {
                setPassword(event.target.value)
              }}
              required
              minLength='8'
            />
          </label>

          {error && (
            <p className='p-4 mx-auto mt-1 bg-red-700 rounded'>
              <span>{error.name}</span>
              <br />
              <span>{error.message}</span>
            </p>
          )}

          <div className='flex flex-col justify-end p-1 mx-auto space-y-2 sm:mr-0 sm:flex-row sm:space-x-2 sm:space-y-0'>
            <button className='btn btn--danger' disabled={password.length < 8}>
              delete
            </button>

            <button
              type='button'
              className='btn btn--secondary'
              onClick={() => {
                modalState.hide()
              }}
            >
              cancel
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
