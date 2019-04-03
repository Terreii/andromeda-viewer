import React, { lazy, Suspense } from 'react'
import { createGlobalStyle } from 'styled-components'

import styles from './main.module.css'

const RootStyle = createGlobalStyle`
  div.rc-tabs.rc-tabs-top {
    height: calc(100vh - 3rem);
    margin-top: 0.5rem; 
  }
`

export const AppContainer = ({ children, className, ...props }) => (
  <div
    {...props}
    className={className ? `${className} ${styles.AppContainer}` : styles.AppContainer}
  >
    <RootStyle />
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
