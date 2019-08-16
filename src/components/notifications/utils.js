import React from 'react'

import styles from './notifications.module.css'

export function Container ({ title, children }) {
  return <div className={styles.Border}>
    {title && <h4>{title}</h4>}

    {children}
  </div>
}

export function Text ({ text }) {
  return <p>
    {text.split('\n').flatMap((line, index) => index === 0
      ? line
      : [<br key={'br_' + index} />, line]
    )}
  </p>
}
