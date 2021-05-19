import { useState, useEffect } from 'react'

import Modal from './modal'

import { signOut, changeEncryptionPassword } from '../../actions/viewerAccount'

import { useDispatch } from '../../hooks/store'
import { useAutoFocus } from '../../hooks/utils'

export default function ResetPasswordDialog ({ type, dialog }) {
  const dispatch = useDispatch()

  const isEncryption = type === 'encryption'

  const [resetKey, setResetKey] = useState('')
  const [password1, setPassword1] = useState('')
  const [password2, setPassword2] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [isChanging, setIsChanging] = useState(false)

  useEffect(() => {
    setResetKey('')
    setPassword1('')
    setPassword2('')
    setErrorMessage(null)
    setIsChanging(false)
  }, [dialog.visible])

  const canChange = !isChanging &&
    resetKey.length === 32 &&
    password1.length >= 8 &&
    password1 === password2

  const onSubmit = async event => {
    event.preventDefault()

    if (canChange) {
      setIsChanging(true)
      setErrorMessage(null)

      try {
        await dispatch(changeEncryptionPassword(resetKey, password1))
      } catch (err) {
        setErrorMessage(err.reason || err.toString())
        setIsChanging(false)
      }
    }
  }

  const onCancel = event => {
    event.preventDefault()
    dialog.hide()
  }

  const doAutoFocus = useAutoFocus()

  return (
    <Modal title='Reset password' dialog={dialog} showOnClose>
      <form onSubmit={onSubmit}>
        <label className='flex flex-col m-1'>
          <span>{isEncryption ? 'Reset-key' : 'Password'}</span>
          <input
            id='oldInput'
            type='text'
            className='block w-full mt-1 text-gray-900 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
            value={resetKey}
            onChange={event => { setResetKey(event.target.value) }}
            autoFocus
            ref={doAutoFocus}
            required
            minLength={isEncryption ? 32 : 8}
            maxLength={isEncryption ? 32 : undefined}
            disabled={isChanging}
          />
          <small id='helpOld' className='leading-6 text-gray-600'>
            Please enter one of your reset-keys
          </small>
          {errorMessage && errorMessage.length > 0 && (
            <small
              id='oldInputError'
              className='px-4 py-2 mt-1 leading-6 text-red-800 bg-red-200 border border-red-500 rounded'
              role='alert'
            >
              {errorMessage}
            </small>
          )}
        </label>

        <label className='flex flex-col m-1'>
          <span>{isEncryption ? 'New encryption Password' : 'New Password'}</span>
          <input
            id='newPassword'
            type='password'
            className='block w-full mt-1 text-gray-900 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
            value={password1}
            onChange={event => { setPassword1(event.target.value) }}
            required
            minLength='8'
            aria-describedby='newPasswordHelp'
            disabled={isChanging}
          />
          <small id='newPasswordHelp' className='leading-6 text-gray-600'>
            Minimal length: 8 characters!
          </small>
        </label>

        <div className='flex flex-col m-1'>
          <label htmlFor='newPassword2'>Repeat new password</label>
          <input
            id='newPassword2'
            type='password'
            className='block w-full mt-1 text-gray-900 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
            value={password2}
            onChange={event => { setPassword2(event.target.value) }}
            required
            minLength='8'
            aria-describedby='secondPwInputError'
            disabled={isChanging}
          />
          {password2.length > 0 && password1 !== password2 && (
            <small
              id='secondPwInputError'
              className='px-4 py-2 mt-1 leading-6 text-red-800 bg-red-200 border border-red-500 rounded'
              role='alert'
            >
              Password doesn't match!
            </small>
          )}
        </div>

        <div className='flex flex-row-reverse justify-between p-1 mt-3'>
          <button
            type='button'
            className='btn btn--secondary'
            onClick={onCancel}
            disabled={isChanging}
          >
            cancel
          </button>
          <button
            type='button'
            className='btn btn--danger'
            onClick={() => {
              dispatch(signOut())
            }}
            disabled={isChanging}
          >
            sign out
          </button>
        </div>
        <div className='flex flex-row-reverse justify-between p-1 mt-3'>
          <button className='btn btn--primary' disabled={!canChange}>
            change {isEncryption ? 'encryption ' : ''}password
          </button>
        </div>
      </form>
    </Modal>
  )
}
