'use strict'

/*
 * Entrypoint into the app on the client side
 *
 */

import React from 'react'
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
import State from './stores/state'

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

export default class App extends React.Component {
  constructor () {
    super()
    this.state = {
      isLoggedIn: false, // Into Avatar
      isSignedIn: false, // To Viewer-account
      avatars: null,
      grids: [],
      popup: '',
      messageOfTheDay: {
        href: '',
        text: ''
      }
    }
  }

  componentDidMount () {
    this._unsubscribe = State.subscribe(this._onChange.bind(this))
    State.dispatch(isSignedIn()).then(isSignedIn => {
      if (isSignedIn) {
        this._loadAvatars()
      } else {
        console.log('Is not signed in.')
      }
    })
    this._onChange()
  }

  _loadAvatars () {
    State.dispatch(loadSavedGrids())
      .then(() => State.dispatch(loadSavedAvatars()))
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
    const close = () => State.dispatch(closePopup())
    switch (this.state.popup) {
      case 'signIn':
        return <SignInPopup onCancel={close} onSend={({username, password}) => {
          State.dispatch(signIn(username, password))
            .then(this._loadAvatars.bind(this))
        }} />
      case 'signUp':
        return <SignInPopup onCancel={close} isSignUp onSend={({username, password}) => {
          State.dispatch(signUp(username, password))
        }} />
      case 'signOut':
        return <SignOutPopup onCancel={close} onSignOut={() => State.dispatch(signOut())} />
      default:
        return null
    }
  }

  render () {
    const mainSection = this.state.isLoggedIn
      ? <ChatBox />
      : <LoginForm
        onLogin={this.onLogin.bind(this)}
        isSignedIn={this.state.isSignedIn}
        avatars={this.state.avatars}
        grids={this.state.grids}
        saveAvatar={(name, grid) => State.dispatch(saveAvatar(name, grid))}
        saveGrid={(name, url) => State.dispatch(saveGrid(name, url))}
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
