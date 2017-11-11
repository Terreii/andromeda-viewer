import React from 'react'
import styled from 'styled-components'

import { logout } from '../actions/sessionActions'
import State from '../stores/state'
import { showSignOutPopup, showSignInPopup } from '../actions/viewerAccount'

const MenuBar = styled.div`
  top: 0em;
  left: 0em;
  width: 100vw;
  background-color: rgb(77, 80, 85);
  color: rgb(211, 211, 211);
  padding-top: .5em;
  padding-bottom: .5em;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  & > * {
    margin: .4em;
  }
`

const Link = styled.a`
  color: white;
`

const LogoutButton = Link.extend`
  :after {
    content: " >>";
  }
`

const AccountMenu = styled.div`
  display: block;
  height: inherit;
  position: relative;
  cursor: pointer;
  color: white;
`

const AccountMenuBody = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 2.05em;
  background-color: rgb(77, 80, 85);
  padding: .6em;
`

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
    State.dispatch(logout())
  }

  _logoutFromViewer (event) {
    event.preventDefault()
    State.dispatch(showSignOutPopup())
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

  _showSignUpPopup (event) {
    event.preventDefault()
    State.dispatch(showSignInPopup('signUp'))
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
      : <a href='#signin' onClick={this._showSignInPopup}>Sign into Andromeda</a>
    return <AccountMenuBody>
      <div>{greeting}</div>
      <div>
        {viewerAccountText}
      </div>
      <div style={{display: viewerAccountLoggedIn ? 'none' : ''}}>
        <a href='#signup' onClick={this._showSignUpPopup}>Sign up to Andromeda</a>
      </div>
      <div style={{display: isLoggedIn ? '' : 'none'}}>
        <LogoutButton href='#' onClick={this._logout}>
          log out
        </LogoutButton>
      </div>
      <div style={{display: viewerAccountLoggedIn ? '' : 'none'}}>
        <Link href='' onClick={this._logoutFromViewer}>
          Log out from Viewer
        </Link>
      </div>
    </AccountMenuBody>
  }

  render () {
    const msgOfDay = this.props.messageOfTheDay
      ? <span>
        Message of the day:
        {this.props.messageOfTheDay.text}
        <Link
          href={this.props.messageOfTheDay.href}
          target='_blank'
          rel='noopener noreferrer'
          >
          {this.props.messageOfTheDay.href}
        </Link>
      </span>
      : <span>Welcome</span>
    return <MenuBar>
      <AccountMenu onClick={this._boundToggleMenu}>
        Account
        {this.renderAccountMenu()}
      </AccountMenu>
      {msgOfDay}
      <span />
    </MenuBar>
  }
}
