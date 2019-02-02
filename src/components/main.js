import React, { lazy, Suspense } from 'react'
import styled from 'styled-components'

export const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 100vh;
  padding: 0px;
  margin: 0px;
  font-family: Helvetica, Arial, sans-serif;
`

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
