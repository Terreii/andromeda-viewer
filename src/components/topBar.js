import React from 'react'
import { connect } from 'react-redux'
import styled, {injectGlobal} from 'styled-components'
import Menu from 'react-burger-menu/lib/menus/slide'
import {
  decorator as reduxBurgerMenu,
  action as toggleMenu
} from 'redux-burger-menu'

import { logout } from '../actions/sessionActions'
import { showSignOutPopup, showSignInPopup } from '../actions/viewerAccount'

const SlideMenu = reduxBurgerMenu(Menu)

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
    margin-top: .4em;
    margin-bottom: .4em;
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

const MenuText = Link.withComponent('span')

injectGlobal`
  .bm-burger-button {
    position: fixed;
    width: 36px;
    height: 30px;
    left: 9px;
    top: 9px;
  }

  .bm-overlay {
    top: 0px;
  }

  .bm-burger-bars {
    background: rgb(211, 211, 211);
  }

  .bm-morph-shape {
    fill: #373a47;
  }

  .bm-menu-wrap {
    top: 0em;
  }

  .bm-menu {
    background: #373a47;

    a, span {
      color: #b8b7ad;

      &:hover,
      &:focus {
        color: #c94e50;
      }
    }
  }

  .bm-item-list a, .bm-item-list span {
    padding: 0.8em 0em 0.8em 0em;
    font-weight: 700;

    span {
      margin-left: 10px;
    }
  }

  .bm-cross {
    background: #bdc3c7;
  }

  .bm-menu {
    padding: 2.5em 1.5em 0;
    font-size: 1.15em;
  }
`

class TopBar extends React.Component {
  constructor () {
    super()
    this.state = {
      showAccountMenu: false
    }
    this._boundLogout = this._logout.bind(this)
    this._boundSignOut = this._logoutFromViewer.bind(this)
    this._boundSignIn = this._showSignInPopup.bind(this)
    this._boundSignUp = this._showSignUpPopup.bind(this)
  }

  _showSignInPopup (event) {
    event.preventDefault()
    this.props.toggleMenu(false)
    this.props.showSignInPopup()
  }

  _showSignUpPopup (event) {
    event.preventDefault()
    this.props.toggleMenu(false)
    this.props.showSignInPopup('signUp')
  }

  _logout (event) {
    event.preventDefault()
    this.props.logout()
  }

  _logoutFromViewer (event) {
    event.preventDefault()
    this.props.toggleMenu(false)
    this.props.showSignOutPopup()
  }

  renderAccountMenu () {
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

    return <SlideMenu>
      <MenuText>{greeting}</MenuText>

      {viewerAccountText}

      <Link
        className='menu-item'
        style={{display: viewerAccountLoggedIn ? 'none' : ''}}
        href='#signup'
        onClick={this._boundSignUp}
        >
        Sign up to Andromeda
      </Link>

      <LogoutButton
        className='menu-item'
        style={{display: isLoggedIn ? '' : 'none'}}
        href='#'
        onClick={this._boundLogout}
        >
        log out
      </LogoutButton>

      <Link
        className='menu-item'
        style={{display: viewerAccountLoggedIn ? '' : 'none'}}
        href=''
        onClick={this._boundSignOut}
        >
        Log out from Viewer
      </Link>
    </SlideMenu>
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
      {this.renderAccountMenu()}
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
  showSignInPopup,
  toggleMenu
}

export default connect(mapStateToProps, mapDispatchToProps)(TopBar)
