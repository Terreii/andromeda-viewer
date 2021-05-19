import { Fragment } from 'react'
import { useDialogState, Dialog, DialogBackdrop } from 'reakit'

import { closeErrorMessage } from '../../bundles/session'

import { useAutoFocus } from '../../hooks/utils'
import { useDispatch } from '../../hooks/store'

import closeIcon from '../../icons/icon_close.svg'

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
    <DialogBackdrop
      {...dialog}
      className='fixed top-0 left-0 z-50 flex items-center justify-center w-screen h-screen bg-black bg-opacity-50'
    >
      <Dialog
        {...dialog}
        className='relative z-50 flex flex-col max-h-screen mx-auto text-gray-900 bg-red-400 rounded'
        role='alertdialog'
        aria-label='Error'
      >
        <div className='flex flex-row-reverse justify-between mx-1 mt-1 mb-0 border-b border-black'>
          <button
            className='p-0 bg-transparent border-0 rounded focus:outline-none focus:ring'
            onClick={event => {
              event.preventDefault()
              dialog.hide()
            }}
          >
            <img src={closeIcon} alt='close error dialog' height='32' width='32' />
          </button>
          <h4 className='mx-5 mt-2 mb-1'>Error!</h4>
        </div>
        <article className='relative flex flex-col m-4 overflow-y-scroll overscroll-y-contain'>
          {errorMessage.split('\n').map((line, index) => (
            <Fragment key={index}>
              {line}
              <br />
            </Fragment>
          ))}

          <button
            type='button'
            className='mt-2 btn'
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
    </DialogBackdrop>
  )
}
