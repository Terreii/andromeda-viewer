import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useDialogState } from 'reakit'

import Modal from './modal'

import { closeResetKeys } from '../../bundles/account'

import { useAutoFocus } from '../../hooks/utils'

import styles from './resetKeys.module.css'
import formStyles from '../formElements.module.css'
import keepItSecret from '../../icons/keepitsecret.png'

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

  return <Modal title='Password reset keys' dialog={dialog} backdrop>
    <form className={styles.Container}>
      <p>
        Those are your <b>encryption reset-keys</b>.<br />
        You need them, when you did forget your encryption-password!<br />
        <b>Please save them!</b><br />
        <b>Save them some where secure!</b><br />
        There is no other way to get your data back!
      </p>

      <ul className={styles.KeysList}>
        {resetKeys.map((key, index) => <li key={`reset-key-${index}`}>
          <span>{key}</span>
        </li>)}
      </ul>

      <p>You can also download them:</p>

      <a
        className={styles.DownloadLink}
        href={fileURL}
        target='_blank'
        rel='noopener noreferrer'
        download='andromeda-viewer-reset-keys.txt'
        ref={doAutoFocus}
      >
        Download as a file
      </a>

      <img
        className={styles.Gandalf}
        src={keepItSecret}
        height='200'
        width='200'
        alt='Gandalf saying: Keep it secret, keep it safe!'
      />

      <p>Remember: If you lose your encryption password and the reset-keys, you lose your data!</p>

      <button
        className={formStyles.OkButton}
        onClick={() => {
          dispatch(closeResetKeys())
        }}
      >
        OK, I did save them!
      </button>
    </form>
  </Modal>
}
