import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { action as toggleMenu } from 'redux-burger-menu'

import TopBar from '../components/topBar'

import { logout } from '../actions/sessionActions'
import { showSignOutPopup, showSignInPopup, showAccountDialog } from '../actions/viewerAccount'

import { getIsSignedIn, getUserName } from '../selectors/viewer'
import { getIsLoggedIn } from '../selectors/session'
import { getOwnAvatarName } from '../selectors/names'

export default function TopBarContainer (props) {
  const isSignedIn = useSelector(getIsSignedIn)
  const userName = useSelector(getUserName)
  const isLoggedIn = useSelector(getIsLoggedIn)
  const avatarName = useSelector(getOwnAvatarName)

  const dispatch = useDispatch()

  const doLogout = event => {
    event.preventDefault()
    dispatch(toggleMenu(false))
    dispatch(logout())
  }

  const doSignOutFromViewer = event => {
    event.preventDefault()
    dispatch(toggleMenu(false))
    dispatch(showSignOutPopup())
  }

  const doShowSignUpPopup = event => {
    event.preventDefault()
    dispatch(toggleMenu(false))
    dispatch(showSignInPopup('signUp'))
  }

  const doShowSignInPopup = event => {
    event.preventDefault()
    dispatch(toggleMenu(false))
    dispatch(showSignInPopup())
  }

  const doShowAccountDialog = event => {
    event.preventDefault()
    dispatch(toggleMenu(false))
    dispatch(showAccountDialog())
  }

  return <TopBar
    isSignedIn={isSignedIn}
    userName={userName}
    isLoggedIn={isLoggedIn}
    avatarName={avatarName}
    signIn={doShowSignInPopup}
    signUp={doShowSignUpPopup}
    signOut={doSignOutFromViewer}
    showAccountDialog={doShowAccountDialog}
    logout={doLogout}
  />
}
