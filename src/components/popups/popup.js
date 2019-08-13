import React from 'react'

import closeIcon from '../../icons/icon_close.svg'
import styles from './popup.module.css'

export default function Popup ({ children, title, onClose }) {
  const showCloseIcon = typeof onClose === 'function'

  const closeIconInHeader = showCloseIcon
    ? <button
      className={'closePopup ' + styles.CloseButton}
      onClick={event => {
        event.preventDefault()
        onClose()
      }}
    >
      <img src={closeIcon} alt='close popup' height='32' width='32' />
    </button>
    : <span />

  return <div className={styles.Background}>
    <div className={styles.Border}>
      <div className={styles.Header}>
        {closeIconInHeader}
        <h4 className={styles.Title}>{title}</h4>
      </div>
      <article className={styles.Content}>
        {children}
      </article>
    </div>
  </div>
}
