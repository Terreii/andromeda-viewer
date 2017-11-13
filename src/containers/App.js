/*
 * Entry-point into the app on the client side
 *
 */

import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import ChatBox from '../components/chatBox'
import LoginForm from '../components/login'
import TopBar from '../components/topBar'
import SignInPopup from '../components/signInPopup'
import SignOutPopup from '../components/signOutPopup'

import {
  closePopup,
  isSignedIn,
  signIn,
  signUp,
  signOut,
  saveAvatar,
  loadSavedAvatars,
  saveGrid,
  loadSavedGrids
} from '../actions/viewerAccount'
import { login } from '../actions/sessionActions'

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

class App extends React.Component {
  componentDidMount () {
    this.props.getIsSignedIn().then(isSignedIn => {
      if (isSignedIn) {
        this._loadAvatars()
      } else {
        console.log('Is not signed in.')
      }
    })
  }

  _loadAvatars () {
    this.props.loadSavedGrids()
      .then(() => this.props.loadSavedAvatars())
  }

  getPopup () {
    const close = this.props.closePopup
    switch (this.props.popup) {
      case 'signIn':
        return <SignInPopup
          onCancel={close}
          onSend={(username, password) => {
            this.props.signIn(username, password)
              .then(this._loadAvatars.bind(this))
          }}
          />

      case 'signUp':
        return <SignInPopup onCancel={close} isSignUp onSend={this.props.signUp} />

      case 'signOut':
        return <SignOutPopup onCancel={close} onSignOut={this.props.signOut} />

      default:
        return null
    }
  }

  render () {
    const isLoggedIn = this.props.isLoggedIn
    const mainSection = isLoggedIn
      ? <ChatBox />
      : <LoginForm
        login={this.props.login}
        isSignedIn={this.props.isSignedIn}
        avatars={this.props.avatars}
        grids={this.props.grids}
        saveAvatar={this.props.saveAvatar}
        saveGrid={this.props.saveGrid}
        />
    return <AppContainer>
      <TopBar messageOfTheDay={isLoggedIn ? this.props.messageOfTheDay : null} />
      {mainSection}
      {this.getPopup()}
    </AppContainer>
  }
}

const mapStateToProps = state => {
  const popup = state.account.getIn(['viewerAccount', 'signInPopup'])
  const avatars = state.account.get('savedAvatars')
  const grids = state.account.get('savedGrids')
  const isSignedIn = state.account.getIn(['viewerAccount', 'loggedIn'])
  const isLoggedIn = state.session.get('loggedIn')
  const messageOfTheDay = state.session.get('message')
  return {
    avatars,
    grids,
    isLoggedIn, // Avatar session
    isSignedIn, // Viewer account
    popup,
    messageOfTheDay
  }
}

const mapDispatchToProps = {
  closePopup,
  getIsSignedIn: isSignedIn,
  signIn, // For viewer-account (to sync)
  signUp,
  signOut,
  saveAvatar,
  loadSavedAvatars,
  saveGrid,
  loadSavedGrids,
  login // For Avatar
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
