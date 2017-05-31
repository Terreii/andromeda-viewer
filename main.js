'use strict'

/*
 * Entrypoint into the app on the client side
 *
 */

import React from 'react'
import ReactDom from 'react-dom'

import ChatBox from './components/chatBox'
import LoginForm from './components/login'
import TopBar from './components/topBar'
import Popup from './components/popup'
import { closePopup } from './actions/viewerAccount'
// import { getAccounts, addAccount } from './stores/database'
import { getMessageOfTheDay } from './session'
import State from './stores/state'

import style from './components/main.css'

class App extends React.Component {
  constructor () {
    super()
    this.state = {
      isLoggedIn: false,
      popup: '',
      messageOfTheDay: {
        href: '',
        text: ''
      }
    }
  }

  componentDidMount () {
    this._unsubscribe = State.subscribe(this._onChange.bind(this))
  }

  _onChange () {
    const activeState = State.getState()
    const popup = activeState.account.getIn(['viewerAccount', 'signInPopup'])
    this.setState({
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
    switch (this.state.popup) {
      case 'signIn':
        return <Popup title='Sign In' onClose={() => State.dispatch(closePopup())}>
          hello
        </Popup>
      case 'signOut':
        return <div />
      default:
        return null
    }
  }

  render () {
    const mainSection = this.state.isLoggedIn
      ? <ChatBox />
      : <LoginForm onLogin={this.onLogin.bind(this)} />
    const msgOfDay = this.state.isLoggedIn
      ? this.state.messageOfTheDay
      : null
    return <div className={style.main}>
      <TopBar messageOfTheDay={msgOfDay} />
      {mainSection}
      {this.getPopup()}
    </div>
  }
}

ReactDom.render(<App />, document.getElementById('app'))
