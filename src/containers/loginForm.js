import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import Login from '../components/login/'

import { login } from '../actions/sessionActions'
import { showSignInPopup } from '../actions/viewerAccount'

import { selectSavedAvatars, selectSavedGrids } from '../reducers/account'

export default function LoginFrom ({ isSignedIn }) {
  const avatars = useSelector(selectSavedAvatars)
  const grids = useSelector(selectSavedGrids)

  const dispatch = useDispatch()
  const doLogin = (avatarName, password, grid, save, isNew) => dispatch(
    login(avatarName, password, grid, save, isNew)
  )
  const doShowSignInPopup = type => dispatch(showSignInPopup(type))

  return <Login
    login={doLogin} // login for avatar
    isSignedIn={isSignedIn}
    avatars={avatars}
    grids={grids}
    showSignInPopup={doShowSignInPopup}
  />
}
