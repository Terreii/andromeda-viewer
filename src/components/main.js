import { lazy, Suspense } from 'react'
import { Redirect } from 'react-router-dom'

import { selectIsLoggedIn } from '../bundles/session'
import { useSelector } from '../hooks/store'

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
