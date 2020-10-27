import { useSelector } from 'react-redux'

import BurgerMenu from './burgerMenu'
import { viewerName } from '../viewerInfo'

import { selectIsLoggedIn } from '../bundles/session'

export default function TopBar () {
  const isLoggedIn = useSelector(selectIsLoggedIn)

  return (
    <div
      className={
        'fixed top-0 left-0 z-50 flex flex-row justify-between w-screen h-12 py-3 text-white ' +
      'bg-gray-700'
      }
    >
      <BurgerMenu isLoggedIn={isLoggedIn} />
      {isLoggedIn
        ? null
        : <span>Login to <span className='capitalize'>{viewerName}</span></span>}
      <span />
    </div>
  )
}
