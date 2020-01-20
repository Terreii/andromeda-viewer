import React from 'react'
import { Portal } from 'reakit/Portal'
import { Dialog, DialogBackdrop } from 'reakit'

import closeIcon from '../../icons/icon_close.svg'
import styles from './modal.module.css'

export default function Modal ({ children, title, showOnClose, backdrop, dialog }) {
  const closeIconInHeader = showOnClose
    ? <button
      className={'closeModal ' + styles.CloseButton}
      onClick={event => {
        event.preventDefault()
        dialog.hide()
      }}
    >
      <img src={closeIcon} alt={`close dialog ${title}`} height='32' width='32' />
    </button>
    : <span />

  return (
    <>
      {backdrop && <Portal>
        <DialogBackdrop {...dialog} className={styles.Background} />
      </Portal>}
      <Dialog {...dialog} className={styles.Border} aria-label={title}>
        <div className={styles.Header}>
          {closeIconInHeader}
          <h4 className={styles.Title}>{title}</h4>
        </div>
        <article className={styles.Content}>
          {children}
        </article>
      </Dialog>
    </>
  )
}
