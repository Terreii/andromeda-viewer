import React from 'react'

import styles from './notifications.module.css'

interface ContainerArgs {
  title: string,
  children: (JSX.Element | undefined)[] | JSX.Element | null
}

export function Container ({ title, children }: ContainerArgs) {
  return <div className={styles.Border}>
    {title && <h4>{title}</h4>}

    {children}
  </div>
}

export function Text ({ text }: { text: string }) {
  return <p>
    {text.split('\n').flatMap((line, index) => index === 0
      ? line
      : [<br key={'br_' + index} />, line]
    )}
  </p>
}
