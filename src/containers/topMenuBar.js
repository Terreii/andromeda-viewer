import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { action as toggleMenu } from 'redux-burger-menu'

import TopBar from '../components/topBar'

import { logout } from '../actions/sessionActions'
import { signOut } from '../actions/viewerAccount'

import { selectIsSignedIn, selectUserName } from '../bundles/account'
import { selectOwnAvatarName } from '../bundles/names'
import { selectIsLoggedIn } from '../bundles/session'

export default function TopBarContainer (props) {
  const isSignedIn = useSelector(selectIsSignedIn)
  const userName = useSelector(selectUserName)
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const avatarName = useSelector(selectOwnAvatarName)

  const dispatch = useDispatch()

  const doLogout = event => {
    event.preventDefault()
    dispatch(toggleMenu(false))
    dispatch(logout())
  }

  const doSignOutFromViewer = event => {
    event.preventDefault()
    dispatch(toggleMenu(false))
    dispatch(signOut())
  }

  return <TopBar
    isSignedIn={isSignedIn}
    userName={userName}
    isLoggedIn={isLoggedIn}
    avatarName={avatarName}
    signOut={doSignOutFromViewer}
    logout={doLogout}
  />
}
