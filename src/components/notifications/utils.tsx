import React from 'react'

import styles from './notifications.module.css'

import { NotificationBase } from '../../types/chat'

interface ContainerArgs {
  title: string,
  children: (JSX.Element | undefined)[] | JSX.Element | null
}

export function Container ({ title, children }: ContainerArgs) {
  return (
    <div className={styles.Border}>
      {title && <h4>{title}</h4>}

      {children}
    </div>
  )
}

export interface ComponentArguments<T extends NotificationBase> {
  /**
   * The notification.
   */
  data: T,
  /**
   * Callback to close the notification.
   */
  onClose: () => void
}
