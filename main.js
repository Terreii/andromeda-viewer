'use strict'

/*
 * Entrypoint into the app on the client side
 *
 */

import React from 'react'
import ReactDom from 'react-dom'

import ChatBox from './components/chatBox'
import LoginForm from './components/login'
import { getAvatarName, getMessageOfTheDay, logout } from './session'

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

  renderMain () {
    const name = getAvatarName()
    return <div className={style.main}>
      <div id='menuBar' className={style.menuBar}>
        <span>Hello {name.getName()}</span>
        <span>
          Message of the day:
          {this.state.messageOfTheDay.text}
          <a
            href={this.state.messageOfTheDay.href}
            target='_blank'
            className={style.daylyMessageLink}
            >
            {this.state.messageOfTheDay.href}
          </a>
        </span>
        <a href='#' className={style.logout} onClick={logout}>logout</a>
      </div>
      <ChatBox />
    </div>
  }

  render () {
    return this.state.isLoggedIn
      ? this.renderMain()
      : <LoginForm onLogin={this.onLogin.bind(this)} />
  }
}

ReactDom.render(<App />, document.getElementById('app'))
