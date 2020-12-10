import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useDialogState, DialogDisclosure } from 'reakit'

import Modal from './modal'
import ResetPasswordDialog from './resetPasswordDialog'

import { signOut, unlock } from '../../actions/viewerAccount'
import { selectUserName } from '../../bundles/account'

import { useAutoFocus } from '../../hooks/utils'

import lockIcon from '../../icons/black_lock.svg'

export default function UnlockDialog () {
  const dialog = useDialogState({ visible: process.env.NODE_ENV !== 'test' })
  const dispatch = useDispatch()
  const username = useSelector(selectUserName)

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
    <div>
      <img
        className='object-contain m-0 mt-1 mr-1'
        src={lockIcon}
        height='30'
        width='30'
        alt=''
      />
    </div>
  )

  return (
    <Modal title='Unlock' icon={icon} dialog={dialog} notCloseable>
      <form className='flex flex-col' onSubmit={doUnlock}>
        <p className='m-1'>
          You are logged in as <strong>{username}</strong>.
          <br />
          Please enter your <em>Password</em> to unlock this app!
        </p>

        <label className='flex flex-col m-1 mt-2'>
          <span>Password</span>
          <input
            id='unlockPasswordIn'
            type='password'
            className='block w-full mt-1 text-gray-900 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
            autoComplete='current-password'
            autoFocus
            ref={doAutoFocus}
            disabled={isUnlocking}
            value={password}
            onChange={event => { setPassword(event.target.value) }}
            aria-describedby='resetPassword'
          />
          <small id='resetPassword' className='leading-6 text-gray-600'>
            If you did forget your encryption-password?
            <DialogDisclosure
              {...resetPasswordState}
              id='resetPasswordButton'
              className='inline p-0 pl-4 m-0 ml-1 text-blue-600 underline border-0 cursor-pointer hover:text-blue-800 focus:text-blue-800'
            >
              Reset password
            </DialogDisclosure>
          </small>
          {errorText && (
            <small
              id='unlockError'
              className='px-4 py-2 mt-1 leading-6 text-red-800 bg-red-200 border border-red-500 rounded'
              role='alert'
            >
              {errorText}
            </small>
          )}
        </label>
        <div className='flex flex-row justify-between p-1 mt-3'>
          <button
            id='signOutButton'
            type='button'
            className='btn btn--danger'
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
            className='btn btn--primary'
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
