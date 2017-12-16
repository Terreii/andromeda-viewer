import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import { logout } from '../actions/sessionActions'
import { showSignOutPopup, showSignInPopup } from '../actions/viewerAccount'

const MenuBar = styled.div`
  z-index: 100;
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

const MenuText = Link.withComponent(styled.span)

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

class TopBar extends React.Component {
  constructor () {
    super()
    this.state = {
      showAccountMenu: false
    }
    this._boundToggleMenu = this._toggleAccountMenu.bind(this)
    this._boundLogout = this._logout.bind(this)
    this._boundSignOut = this._logoutFromViewer.bind(this)
    this._boundSignIn = this._showSignInPopup.bind(this)
    this._boundSignUp = this._showSignUpPopup.bind(this)
  }

  _logout (event) {
    event.preventDefault()
    this.props.logout()
  }

  _logoutFromViewer (event) {
    event.preventDefault()
    this.props.showSignOutPopup()
  }

  _toggleAccountMenu (event) {
    if (this.state.showAccountMenu) return

    setTimeout(() => window.addEventListener('click', event => {
      this.setState({
        showAccountMenu: false
      })
    }, {
      once: true
    }), 10)
    this.setState({
      showAccountMenu: true
    })
  }

  _showSignInPopup (event) {
    event.preventDefault()
    this.props.showSignInPopup()
  }

  _showSignUpPopup (event) {
    event.preventDefault()
    this.props.showSignInPopup('signUp')
  }

  renderAccountMenu () {
    if (!this.state.showAccountMenu) return null
    const isLoggedIn = this.props.account.get('loggedIn')

    const greeting = isLoggedIn
      ? `Hello ${this.props.account.get('avatarName')}`
      : ''

    const viewerAccountLoggedIn = this.props.account.getIn([
      'viewerAccount',
      'loggedIn'
    ])

    const viewerAccountText = viewerAccountLoggedIn
      ? <MenuText>
        {`Hello ${this.props.account.getIn(['viewerAccount', 'username'])}`}
      </MenuText>
      : <Link href='#signin' onClick={this._boundSignIn}>
        Sign into Andromeda
      </Link>

    return <AccountMenuBody>
      <div>{greeting}</div>

      {viewerAccountText}

      <Link
        style={{display: viewerAccountLoggedIn ? 'none' : ''}}
        href='#signup'
        onClick={this._boundSignUp}
        >
        Sign up to Andromeda
      </Link>

      <LogoutButton
        style={{display: isLoggedIn ? '' : 'none'}}
        href='#'
        onClick={this._boundLogout}
        >
        log out
      </LogoutButton>

      <Link
        style={{display: viewerAccountLoggedIn ? '' : 'none'}}
        href=''
        onClick={this._boundSignOut}
        >
        Log out from Viewer
      </Link>
    </AccountMenuBody>
  }

  render () {
    const msgOfDay = this.props.messageOfTheDay
      ? <span>
        Message of the day:
        {this.props.messageOfTheDay.get('text')}
        <Link
          href={this.props.messageOfTheDay.get('href')}
          target='_blank'
          rel='noopener noreferrer'
          >
          {this.props.messageOfTheDay.get('href')}
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

const mapStateToProps = state => {
  return {
    account: state.account
  }
}

const mapDispatchToProps = {
  logout,
  showSignOutPopup,
  showSignInPopup
}

export default connect(mapStateToProps, mapDispatchToProps)(TopBar)
