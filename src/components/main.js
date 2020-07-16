import React, { lazy, Suspense } from 'react'
import { useSelector } from 'react-redux'
import { Redirect } from 'react-router-dom'

import { selectIsLoggedIn } from '../bundles/session'

const ChatBox = lazy(() => import('./chatBox'))

export function LoadableChatComponent () {
  const isLoggedIn = useSelector(selectIsLoggedIn)

  if (!isLoggedIn) {
    return <Redirect push to='/' />
  }

  const fallback = (
    <div className='flex flex-col items-center justify-center bg-black bg-opacity-50'>
      <span>Loading ...</span>
    </div>
  )

  return (
    <Suspense fallback={fallback}>
      <ChatBox />
    </Suspense>
  )
}
