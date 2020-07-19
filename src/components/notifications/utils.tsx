import React from 'react'

import { NotificationBase } from '../../types/chat'

interface ContainerArgs {
  title: string,
  children: (JSX.Element | undefined)[] | JSX.Element | null
}

export function Container ({ title, children }: ContainerArgs) {
  return (
    <div className='p-4 bg-gray-400 rounded focus:shadow-outline focus:outline-none' tabIndex={0}>
      {title && <h4>{title}</h4>}

      {children}
    </div>
  )
}

export function ButtonsRow (
  { children }: { children: (JSX.Element | undefined | boolean)[] | JSX.Element | null | boolean }
) {
  return <div className='flex flex-row justify-center space-y-8'>
    {children}
  </div>
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
