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
// import { getAccounts, addAccount } from './stores/database'
import { getMessageOfTheDay } from './session'

import style from './components/main.css'

class App extends React.Component {
  constructor () {
    super()
    this.state = {
      isLoggedIn: false,
      messageOfTheDay: {
        href: '',
        text: ''
      }
    }
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
    </div>
  }
}

ReactDom.render(<App />, document.getElementById('app'))
