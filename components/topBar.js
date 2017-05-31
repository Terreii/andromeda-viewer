'use strict'

import React from 'react'

import { logout } from '../session'
import State from '../stores/state'
import {
  didLogIn as viewerAccountLogIn,
  showSignInPopup
} from '../actions/viewerAccount'

import style from './topBar.css'

export default class TopBar extends React.Component {
  constructor () {
    super()
    this.state = {
      account: State.getState().account,
      savedAvatars: [],
      showAccountMenu: false
    }
    this._boundToggleMenu = this._toggleAccountMenu.bind(this)
  }

  componentDidMount () {
    this._unsubscribe = State.subscribe(this._onChange.bind(this))
    window.hoodie.account.get(['session', 'username']).then(properties => {
      const isLoggedIn = properties.session != null
      const action = viewerAccountLogIn(isLoggedIn, properties.username)
      State.dispatch(action)
    })
  }

  componentWillUnmount () {
    this._unsubscribe()
  }

  _onChange () {
    const account = State.getState().account
    if (account === this.state.account) return
    this.setState({
      account
    })
  }

  _logout (event) {
    event.preventDefault()
    logout()
  }

  _logoutFromViewer (event) {
    event.preventDefault()
    if (State.getState().account.get('loggedIn')) {
      logout()
    }
    window.hoodie.account.signOut().then(result => {
      const action = viewerAccountLogIn(false)
      State.dispatch(action)
    }).catch(err => console.error(err))
  }

  _toggleAccountMenu (event) {
    this.setState({
      showAccountMenu: !this.state.showAccountMenu
    })
  }

  _showSignInPopup (event) {
    event.preventDefault()
    State.dispatch(showSignInPopup())
  }

  renderAccountMenu () {
    if (!this.state.showAccountMenu) return null
    const isLoggedIn = this.state.account.get('loggedIn')
    const greeting = isLoggedIn
      ? `Hello ${this.state.account.get('avatarName')}`
      : ''
    const viewerAccountLoggedIn = this.state.account.getIn([
      'viewerAccount',
      'loggedIn'
    ])
    const viewerAccountText = viewerAccountLoggedIn
      ? `Hello ${this.state.account.getIn(['viewerAccount', 'username'])}`
      : <a href='#' onClick={this._showSignInPopup}>Login to Andromeda</a>
    return <div className={style.AccountMenuBody}>
      <div>{greeting}</div>
      <div>
        {viewerAccountText}
      </div>
      <div style={{display: isLoggedIn ? '' : 'none'}}>
        <a href='#' className={style.logout} onClick={this._logout}>
          log out
        </a>
      </div>
      <div style={{display: viewerAccountLoggedIn ? '' : 'none'}}>
        <a href='' className={style.Link} onClick={this._logoutFromViewer}>
          Log out from Viewer
        </a>
      </div>
    </div>
  }

  render () {
    const msgOfDay = this.props.messageOfTheDay
      ? <span>
        Message of the day:
        {this.props.messageOfTheDay.text}
        <a
          href={this.props.messageOfTheDay.href}
          target='_blank'
          className={style.daylyMessageLink}
          rel='noopener noreferrer'
          >
          {this.props.messageOfTheDay.href}
        </a>
      </span>
      : <span>Welcome</span>
    return <div className={style.menuBar}>
      <div className={style.AccountMenu} onClick={this._boundToggleMenu}>
        Account
        {this.renderAccountMenu()}
      </div>
      {msgOfDay}
      <span />
    </div>
  }
}
