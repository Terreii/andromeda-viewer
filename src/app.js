/*
 * Entry-point into the app on the client side
 */

import React, { useEffect } from 'react'
import { Provider, useSelector, useDispatch } from 'react-redux'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'

import { viewerName } from './viewerInfo'

import { AppContainer, LoadableChatComponent } from './components/main'
import Login from './components/login'
import GlobalModals from './components/modals/globalModals'
import TopMenuBar from './components/topBar'
import AccountDialog from './components/accountDialog'

import { isSignedIn as getIsSignedIn } from './actions/viewerAccount'

import { selectIsSignedIn } from './bundles/account'
import { selectOwnAvatarName } from './bundles/names'
import { selectIsLoggedIn } from './bundles/session'

import 'normalize.css'

export default function Root ({ store }) {
  return <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
}

function App () {
  const isSignedIn = useSelector(selectIsSignedIn)

  const dispatch = useDispatch()

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && isSignedIn) {
      return // component was hot reloaded
    }

    dispatch(getIsSignedIn())
    // it will only be called once!
    // eslint-disable-next-line
  }, [])

  useDocumentTitle()

  return <AppContainer>
    <Switch>
      <Route exact path='/'>
        <Login isSignedIn={isSignedIn} />
      </Route>
      <Route path='/session'>
        <LoadableChatComponent />
      </Route>
      <Route path='/profile'>
        {isSignedIn
          ? <AccountDialog />
          : <Redirect to='/' />
        }
      </Route>
      <Route path='*'>
        <NoMatchRedirect />
      </Route>
    </Switch>
    <TopMenuBar />
    <GlobalModals />
  </AppContainer>
}

function useDocumentTitle () {
  const selfName = useSelector(selectOwnAvatarName)
  const isLoggedIn = useSelector(selectIsLoggedIn)

  useEffect(() => {
    document.title = isLoggedIn
      ? `${selfName.getName()} - ${viewerName}`
      : viewerName
  }, [isLoggedIn, selfName])
}

function NoMatchRedirect () {
  const isLoggedIn = useSelector(selectIsLoggedIn)

  return <Redirect to={isLoggedIn ? '/session' : '/'} />
}