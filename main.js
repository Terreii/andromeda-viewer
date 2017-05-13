'use strict'

/*
 * Entrypoint into the app on the client side
 *
 */

import React from 'react'
import ReactDom from 'react-dom'

import Main from './components/main'
import LoginForm from './components/login'

class App extends React.Component {
  constructor () {
    super()
    this.state = {
      isLoggedIn: false
    }
  }

  onLogin (did) {
    this.setState({
      isLoggedIn: did
    })
  }

  render () {
    return this.state.isLoggedIn
      ? <Main />
      : <LoginForm onLogin={this.onLogin.bind(this)} />
  }
}

ReactDom.render(<App />, document.getElementById('app'))
