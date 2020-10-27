import Modal from './modal'

import { useAutoFocus } from '../../hooks/utils'

export default function SignOutModal ({ dialog, onSignOut }) {
  const doAutoFocus = useAutoFocus()

  return (
    <Modal title='Sign Out?' dialog={dialog} showOnClose>
      <p>Do you want to sign out?</p>
      <div className='flex flex-col p-1 mt-3 sm:justify-between sm:flex-row'>
        <button type='button' className='btn btn--danger' onClick={onSignOut} ref={doAutoFocus}>
          sign out
        </button>
        <button
          type='button'
          className='mt-3 sm:mt-0 btn btn--secondary'
          onClick={event => {
            event.preventDefault()
            dialog.hide()
          }}
        >
          cancel
        </button>
      </div>
    </Modal>
  )
}
