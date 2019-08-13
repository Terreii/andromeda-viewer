/*
 * Entry-point into the app on the client side
 *
 */

import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { AppContainer, LoadableChatComponent } from '../components/main'
import LoginForm from './loginForm'
import Popups from './popups'
import Helmet from './helmet'
import TopMenuBar from './topMenuBar'

import { isSignedIn as doGetIsSignedIn } from '../actions/viewerAccount'

import { getIsSignedIn } from '../selectors/viewer'
import { getIsLoggedIn } from '../selectors/session'

import 'normalize.css'

export default function App (props) {
  const isLoggedIn = useSelector(getIsLoggedIn)
  const isSignedIn = useSelector(getIsSignedIn)

  const dispatch = useDispatch()

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && isSignedIn) {
      return // component was hot reloaded
    }

    dispatch(doGetIsSignedIn())
    // it will only be called once!
    // eslint-disable-next-line
  }, [])

  return <AppContainer>
    <Helmet />
    {isLoggedIn
      ? <LoadableChatComponent />
      : <LoginForm isSignedIn={isSignedIn} />
    }
    <TopMenuBar />
    <Popups />
  </AppContainer>
}
