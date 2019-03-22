import React, { lazy, Suspense } from 'react'
import styled, { createGlobalStyle } from 'styled-components'

const RootStyle = createGlobalStyle`
  :root, body {
    margin: 0px;
    padding: 0px;
  }

  div.rc-tabs.rc-tabs-top {
    height: calc(100vh - 3rem);
    margin-top: 0.5rem; 
  }
`

const AppContainerStyle = styled.div`
  top: 0px;
  left: 0px;
  width: 100vw;
  padding: 0px;
  padding-top: 2.5rem;
  margin: 0px;
  font-family: Helvetica, Arial, sans-serif;
`

export const AppContainer = ({ children, ...props }) => (
  <AppContainerStyle {...props}>
    <RootStyle />
    {children}
  </AppContainerStyle>
)

const LoadingView = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: rgba(0, 0, 0, 0.5);
`

const ChatContainer = lazy(() => import('../containers/chatContainer'))

export function LoadableChatComponent () {
  const fallback = <LoadingView>
    <span>Loading ...</span>
  </LoadingView>

  return <Suspense fallback={fallback}>
    <ChatContainer />
  </Suspense>
}
