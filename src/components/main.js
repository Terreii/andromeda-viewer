import React, { lazy, Suspense } from 'react'

import styles from './main.module.css'

export const AppContainer = ({ children, className, ...props }) => (
  <div
    {...props}
    className={className ? `${className} ${styles.AppContainer}` : styles.AppContainer}
  >
    {children}
  </div>
)

const ChatContainer = lazy(() => import('../containers/chatContainer'))

export function LoadableChatComponent () {
  const fallback = <div className={styles.LoadingView}>
    <span>Loading ...</span>
  </div>

  return <Suspense fallback={fallback}>
    <ChatContainer />
  </Suspense>
}
