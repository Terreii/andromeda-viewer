/*
 * Entry-point into the app on the client side
 *
 */

import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import ChatBox from './components/chatBox'
import LoginForm from './components/login'
import TopBar from './components/topBar'
import SignInPopup from './components/signInPopup'
import SignOutPopup from './components/signOutPopup'

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
} from './actions/viewerAccount'

import { getMessageOfTheDay } from './session'
import State from './store/state'

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
  constructor () {
    super()
    this.state = {
      isLoggedIn: false, // Into Avatar
      messageOfTheDay: {
        href: '',
        text: ''
      }
    }
  }

  componentDidMount () {
    this._unsubscribe = State.subscribe(this._onChange.bind(this))
    this.props.getIsSignedIn().then(isSignedIn => {
      if (isSignedIn) {
        this._loadAvatars()
      } else {
        console.log('Is not signed in.')
      }
    })
    this._onChange()
  }

  _loadAvatars () {
    this.props.loadSavedGrids()
      .then(() => this.props.loadSavedAvatars())
  }

  _onChange () {
    const activeState = State.getState()
    const popup = activeState.account.getIn(['viewerAccount', 'signInPopup'])
    const avatars = activeState.account.get('savedAvatars')
    const grids = activeState.account.get('savedGrids')
    const isSignedIn = activeState.account.getIn(['viewerAccount', 'loggedIn'])
    this.setState({
      avatars,
      grids,
      isSignedIn,
      popup
    })
  }

  onLogin (did) {
    if (!did) return
    const messageOfTheDay = getMessageOfTheDay()
    const index = messageOfTheDay.search('http')
    const msgOfDayHref = messageOfTheDay.substr(index)
    const msgOfDayText = messageOfTheDay.substr(0, index)
    this.setState({
      isLoggedIn: did,
      messageOfTheDay: {
        href: msgOfDayHref,
        text: msgOfDayText
      }
    })
  }

  getPopup () {
    const close = this.props.closePopup
    switch (this.props.popup) {
      case 'signIn':
        return <SignInPopup onCancel={close} onSend={(username, password) => {
          this.props.signIn(username, password)
            .then(this._loadAvatars.bind(this))
        }} />
      case 'signUp':
        return <SignInPopup onCancel={close} isSignUp onSend={this.props.signUp} />
      case 'signOut':
        return <SignOutPopup onCancel={close} onSignOut={this.props.signOut} />
      default:
        return null
    }
  }

  render () {
    const mainSection = this.state.isLoggedIn
      ? <ChatBox />
      : <LoginForm
        onLogin={this.onLogin.bind(this)}
        isSignedIn={this.props.isSignedIn}
        avatars={this.props.avatars}
        grids={this.props.grids}
        saveAvatar={this.props.saveAvatar}
        saveGrid={this.props.saveGrid}
        />
    const msgOfDay = this.state.isLoggedIn
      ? this.state.messageOfTheDay
      : null
    return <AppContainer>
      <TopBar messageOfTheDay={msgOfDay} />
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
  return {
    avatars,
    grids,
    isSignedIn,
    popup
  }
}

const mapDispatchToProps = {
  closePopup,
  getIsSignedIn: isSignedIn,
  signIn,
  signUp,
  signOut,
  saveAvatar,
  loadSavedAvatars,
  saveGrid,
  loadSavedGrids
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
