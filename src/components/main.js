import React, { lazy, Suspense } from 'react'
import { useSelector } from 'react-redux'
import { Redirect } from 'react-router-dom'

import { selectIsLoggedIn } from '../reducers/session'

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
  const isLoggedIn = useSelector(selectIsLoggedIn)

  if (!isLoggedIn) {
    return <Redirect push to='/' />
  }

  const fallback = <div className={styles.LoadingView}>
    <span>Loading ...</span>
  </div>

  return <Suspense fallback={fallback}>
    <ChatContainer />
  </Suspense>
}
