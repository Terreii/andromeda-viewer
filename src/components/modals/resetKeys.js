import { useState, useEffect } from 'react'
import { useDialogState } from 'reakit'

import Modal from './modal'

import { viewerName } from '../../viewerInfo'
import { closeResetKeys } from '../../bundles/account'

import { useDispatch } from '../../hooks/store'
import { useAutoFocus } from '../../hooks/utils'

import keepItSecret from '../../icons/keepitsecret.png'

/**
 * Display the Password reset keys and generate a downloadable file containing them.
 * @param {object}   param           React arguments.
 * @param {string[]} param.resetKeys Password reset keys.
 */
export default function ResetKeysModal ({ resetKeys }) {
  const dispatch = useDispatch()
  const dialog = useDialogState({ visible: process.env.NODE_ENV !== 'test' })

  const [fileURL, setFileURL] = useState('')
  useEffect(() => {
    const blob = new window.Blob(
      resetKeys.map(key => key + '\r\n'),
      { type: 'text/plain' }
    )
    const objURL = URL.createObjectURL(blob)

    setFileURL(objURL)
    return () => {
      URL.revokeObjectURL(objURL)
    }
  }, [resetKeys])

  const doAutoFocus = useAutoFocus()

  return (
    <Modal title='Password reset keys' dialog={dialog} notCloseable>
      <form className='flex flex-col leading-6 text-center'>
        <p id='reset_keys_info_text'>
          Those are your <b>encryption reset-keys</b>.<br />
          You need them, when you did forget your password!<br />
          <b>Please save them!</b><br />
          <b>Save them some where secure!</b><br />
          There is no other way to get your data back!
        </p>

        <details className='my-3'>
          <summary>Why do I need them?</summary>

          <p>
            All your data gets encrypted on your machine.
            <br />
            And only the encrypted data is stored on our servers.
            <br />
            But if you loose your password, there is no way to regain your data!
            <br />
            Except with one of those reset keys.
          </p>
        </details>

        <ul className='p-0 font-mono text-sm list-none'>
          {resetKeys.map((key, index) => (
            <li key={`reset-key-${index}`} className='leading-8'>
              <span className='p-1 bg-gray-500 rounded'>{key}</span>
            </li>
          ))}
        </ul>

        <p>You can also download them:</p>

        <a
          className='block mx-auto no-underline btn btn--primary'
          href={fileURL}
          target='_blank'
          rel='noopener noreferrer'
          download={viewerName + '-reset-keys.txt'}
          ref={doAutoFocus}
          title='download all your password-reset-keys as a file'
          aria-describedby='reset_keys_info_text'
        >
          Download as a file
        </a>

        <img
          className='mx-auto mt-4'
          src={keepItSecret}
          height='200'
          width='200'
          alt='Gandalf saying: Keep it secret, keep it safe!'
        />

        <p className='mt-4'>
          Remember: If you lose your password and the reset-keys, you lose your data!
        </p>

        <button
          type='button'
          className='mx-auto mt-2 mb-1 btn btn--ok'
          onClick={() => {
            dispatch(closeResetKeys())
          }}
        >
          OK, I did save them!
        </button>
      </form>
    </Modal>
  )
}
