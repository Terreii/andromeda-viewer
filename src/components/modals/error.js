import React from 'react'
import { useDispatch } from 'react-redux'
import { useDialogState, Dialog, DialogBackdrop, Portal } from 'reakit'

import { closeErrorMessage } from '../../bundles/session'

import { useAutoFocus } from '../../hooks/utils'

import closeIcon from '../../icons/icon_close.svg'
import styles from './modal.module.css'
import formStyles from '../formElements.module.css'

/**
 * Displays session error messages.
 * @param {object} param              React props.
 * @param {string} param.errorMessage Error message that should be displayed.
 */
export default function ErrorDialog ({ errorMessage }) {
  const dispatch = useDispatch()
  const dialog = useDialogState(() => ({ visible: process.env.NODE_ENV !== 'test' }))
  const autoFocusRef = useAutoFocus()

  return (
    <>
      {process.env.NODE_ENV !== 'test' && (
        <Portal>
          <DialogBackdrop {...dialog} className={styles.Background} />
        </Portal>
      )}
      <Dialog
        {...dialog}
        className={styles.Error}
        role='alertdialog'
        aria-label='Error'
      >
        <div className={styles.Header}>
          <button
            className={'closeModal ' + styles.CloseButton}
            onClick={event => {
              event.preventDefault()
              dialog.hide()
            }}
          >
            <img src={closeIcon} alt='close error dialog' height='32' width='32' />
          </button>
          <h4 className={styles.Title}>Error!</h4>
        </div>
        <article className={styles.Content}>
          {errorMessage.split('\n').map((line, index) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ))}

          <button
            type='button'
            className={formStyles.Button + ' ' + styles.ErrorButton}
            onClick={() => {
              dispatch(closeErrorMessage())
              dialog.hide()
            }}
            ref={autoFocusRef}
          >
            close
          </button>
        </article>
      </Dialog>
    </>
  )
}
