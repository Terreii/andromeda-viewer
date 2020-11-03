import { Dialog, DialogBackdrop } from 'reakit'

import closeIcon from '../../icons/icon_close.svg'

/**
 * The container of a Modal.
 * @param {object} param React params.
 * @param {(JSX.Element | undefined)[] | JSX.Element | null} param.children React content.
 * @param {string}       param.title   The title of the modal dialog.
 * @param {JSX.Element?} param.icon   Icon that will be displayed in the header.
 * @param {boolean?}     param.showCloseButton   Show a close icon in the header.
 * @param {object}       param.dialog  Reakit dialog state.
 * @param {boolean?}     param.notCloseable  If true then this dialog can not be closed by clicking outside.
 */
export default function Modal ({ children, title, icon, showCloseButton, dialog, notCloseable }) {
  const closeable = !notCloseable

  const closeIconInHeader = showCloseButton && closeable
    ? (
      <button
        className='p-0 bg-transparent border-0 rounded focus:outline-none focus:shadow-outline'
        onClick={event => {
          event.preventDefault()
          dialog.hide()
        }}
      >
        <img src={closeIcon} alt={`close dialog ${title}`} height='32' width='32' />
      </button>
      )
    : <span />

  return (
    <DialogBackdrop
      {...dialog}
      className='fixed top-0 left-0 z-50 flex items-center justify-center w-screen h-screen bg-black bg-opacity-50'
    >
      <Dialog
        {...dialog}
        className='relative z-50 flex flex-col max-h-screen mx-auto text-gray-900 bg-white rounded'
        aria-label={title}
        hideOnEsc={closeable}
        hideOnClickOutside={closeable}
      >
        <div className='flex flex-row-reverse justify-between mx-1 mt-1 mb-0 border-b border-black'>
          {closeIconInHeader}

          <div className='flex flex-row ml-2 mr-5'>
            {icon}
            <h4 className='my-2 ml-1'>{title}</h4>
          </div>
        </div>

        <article className='relative flex flex-col m-4 overflow-y-scroll overscroll-y-contain'>
          {children}
        </article>
      </Dialog>
    </DialogBackdrop>
  )
}
