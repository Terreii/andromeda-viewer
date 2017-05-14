'use strict'

import React from 'react'

import { logout } from '../session'
import State from '../stores/state'

import style from './main.css'

export default class TopBar extends React.Component {
  constructor () {
    super()
    this.state = {
      account: State.getState().account,
      savedAvatars: []
    }
  }

  componentDidMount () {
    this._unsubscribe = State.subscribe(this._onChange.bind(this))
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

  render () {
    const isLoggedIn = this.state.account.get('loggedIn')
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
    const logOutButton = isLoggedIn
      ? <a href='#' className={style.logout} onClick={this._logout}>logout</a>
      : <span />
    const greeting = isLoggedIn
      ? `Hello ${this.state.account.get('avatarName')}`
      : ''
    return <div className={style.menuBar}>
      <span>{greeting}</span>
      {msgOfDay}
      {logOutButton}
    </div>
  }
}
