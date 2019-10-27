/*
 * Entry-point into the app on the client side
 *
 */

import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Route, Switch } from 'react-router-dom'

import { viewerName } from '../viewerInfo'

import { AppContainer, LoadableChatComponent } from '../components/main'
import LoginForm from './loginForm'
import PopupRenderer from './popups'
import TopMenuBar from './topMenuBar'
import ProfileContainer from '../components/accountDialog'

import { isSignedIn as doGetIsSignedIn } from '../actions/viewerAccount'

import { getIsSignedIn } from '../selectors/viewer'
import { getIsLoggedIn } from '../selectors/session'
import { getOwnAvatarName } from '../selectors/names'

import 'normalize.css'

const Popups = React.memo(PopupRenderer)

export default function App () {
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

  useDocumentTitle()

  return <AppContainer>
    <Switch>
      <Route exact path='/'>
        <LoginForm isSignedIn={isSignedIn} />
      </Route>
      <Route path='/session'>
        <LoadableChatComponent />
      </Route>
      {isSignedIn && <Route path='/profile'>
        <ProfileContainer />
      </Route>}
    </Switch>
    <TopMenuBar />
    <Popups />
  </AppContainer>
}

function useDocumentTitle () {
  const selfName = useSelector(getOwnAvatarName)
  const isLoggedIn = useSelector(getIsLoggedIn)

  useEffect(() => {
    document.title = isLoggedIn
      ? `${selfName.getName()} - ${viewerName}`
      : viewerName
  }, [isLoggedIn, selfName])
}
