import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import Login from '../components/login/'

import { login } from '../actions/sessionActions'

import { selectSavedAvatars, selectSavedGrids } from '../bundles/account'

export default function LoginFrom ({ isSignedIn }) {
  const avatars = useSelector(selectSavedAvatars)
  const grids = useSelector(selectSavedGrids)

  const dispatch = useDispatch()
  const doLogin = (avatarName, password, grid, save, isNew) => dispatch(
    login(avatarName, password, grid, save, isNew)
  )

  return <Login
    login={doLogin} // login for avatar
    isSignedIn={isSignedIn}
    avatars={avatars}
    grids={grids}
  />
}
