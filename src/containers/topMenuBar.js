import React from 'react'
import { connect } from 'react-redux'
import { action as toggleMenu } from 'redux-burger-menu'

import TopBar from '../components/topBar'

import { logout } from '../actions/sessionActions'
import { showSignOutPopup, showSignInPopup } from '../actions/viewerAccount'

import { getIsSignedIn, getUserName } from '../selectors/viewer'
import { getIsLoggedIn } from '../selectors/session'
import { getOwnAvatarName } from '../selectors/names'

class TopBarContainer extends React.Component {
  constructor () {
    super()
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
    this.props.toggleMenu(false)
    this.props.logout()
  }

  _logoutFromViewer (event) {
    event.preventDefault()
    this.props.toggleMenu(false)
    this.props.showSignOutPopup()
  }

  render () {
    return <TopBar
      isSignedIn={this.props.isSignedIn}
      userName={this.props.userName}
      isLoggedIn={this.props.isLoggedIn}
      avatarName={this.props.avatarName}
      signIn={this._boundSignIn}
      signUp={this._boundSignUp}
      signOut={this._boundSignOut}
      logout={this._boundLogout}
    />
  }
}

const mapStateToProps = state => {
  return {
    isSignedIn: getIsSignedIn(state),
    userName: getUserName(state),
    isLoggedIn: getIsLoggedIn(state),
    avatarName: getOwnAvatarName(state)
  }
}

const mapDispatchToProps = {
  logout,
  showSignOutPopup,
  showSignInPopup,
  toggleMenu
}

export default connect(mapStateToProps, mapDispatchToProps)(TopBarContainer)
