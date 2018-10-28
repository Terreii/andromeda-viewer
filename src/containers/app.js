/*
 * Entry-point into the app on the client side
 *
 */

import React from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'

import { AppContainer, LoadableChatComponent } from '../components/main'
import LoginForm from '../components/login/'
import PopupRenderer from '../components/popups/'

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

const Popups = React.memo(PopupRenderer)

class App extends React.PureComponent {
  componentDidMount () {
    if (process.env.NODE_ENV !== 'production') {
      if (this.props.isSignedIn) return // component was hot reloaded
    }

    this.props.getIsSignedIn()
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
      <Popups
        popup={!this.props.isUnlocked && this.props.isSignedIn
          ? 'unlock'
          : this.props.popup}
        closePopup={this.props.closePopup}
        signUp={this.props.signUp}
        signIn={this.props.signIn}
        unlock={this.props.unlock}
        signOut={this.props.signOut}
      />
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
