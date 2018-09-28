/*
 * Entry-point into the app on the client side
 *
 */

import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import Helmet from 'react-helmet'
import Loadable from 'react-loadable'

import LoginForm from '../components/login/'
import Popup from '../components/popup'
import SignInPopup from '../components/signInPopup'
import SignOutPopup from '../components/signOutPopup'
import UnlockDialog from '../components/unlockDialog'

import TopMenuBar from './topMenuBar'

import {
  closePopup,
  isSignedIn,
  unlock,
  showSignInPopup,
  signIn,
  signUp,
  signOut
} from '../actions/viewerAccount'
import { login } from '../actions/sessionActions'

import { viewerName } from '../viewerInfo'

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 100vh;
  padding: 0px;
  margin: 0px;
`

const LoadableChatComponent = Loadable({
  loader: () => import('./chatContainer'),
  loading: () => <div>Loading ...</div>
})

class App extends React.Component {
  componentDidMount () {
    if (process.env.NODE_ENV !== 'production') {
      if (this.props.isSignedIn) return // component was hot reloaded
    }

    this.props.getIsSignedIn()
  }

  getPopup () {
    const popup = this.props.popup
    if (popup == null || popup.length === 0) return null
    const close = this.props.closePopup

    switch (popup) {
      case 'signIn':
        return <SignInPopup onCancel={close} onSend={this.props.signIn} />

      case 'signUp':
        return <SignInPopup onCancel={close} isSignUp onSend={this.props.signUp} />

      case 'signOut':
        return <SignOutPopup onCancel={close} onSignOut={this.props.signOut} />

      default:
        return <Popup title={'Error'} onClose={close}>
          {popup}
        </Popup>
    }
  }

  render () {
    const isLoggedIn = this.props.isLoggedIn
    const mainSection = isLoggedIn
      ? <LoadableChatComponent />
      : <LoginForm
        login={this.props.login}
        isSignedIn={this.props.isSignedIn}
        avatars={this.props.avatars}
        grids={this.props.grids}
        showSignInPopup={this.props.showSignInPopup}
      />

    return <AppContainer>
      <Helmet
        titleTemplate={`%s - ${viewerName}`}
        defaultTitle={viewerName}
      />
      <TopMenuBar messageOfTheDay={isLoggedIn ? this.props.messageOfTheDay : null} />
      {mainSection}
      {this.getPopup()}
      {!this.props.isUnlocked && this.props.isSignedIn
        ? <UnlockDialog
          onUnlock={this.props.unlock}
          onSignOut={this.props.signOut}
        />
        : null}
    </AppContainer>
  }
}

const mapStateToProps = state => {
  const popup = state.account.getIn(['viewerAccount', 'signInPopup']) ||
    state.session.get('error')
  const avatars = state.account.get('savedAvatars')
  const isUnlocked = state.account.get('unlocked')
  const grids = state.account.get('savedGrids')
  const isSignedIn = state.account.getIn(['viewerAccount', 'loggedIn'])
  const isLoggedIn = state.session.get('loggedIn')
  const messageOfTheDay = state.session.get('message')
  return {
    avatars,
    grids,
    isUnlocked,
    isLoggedIn, // Avatar session
    isSignedIn, // Viewer account
    popup,
    messageOfTheDay
  }
}

const mapDispatchToProps = {
  closePopup,
  getIsSignedIn: isSignedIn,
  showSignInPopup,
  unlock,
  signIn, // For viewer-account (to sync)
  signUp,
  signOut,
  login // For Avatar
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
