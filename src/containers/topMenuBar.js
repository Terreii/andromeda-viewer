import React from 'react'
import {connect} from 'react-redux'
import {action as toggleMenu} from 'redux-burger-menu'

import TopBar from '../components/topBar'

import {logout} from '../actions/sessionActions'
import {showSignOutPopup, showSignInPopup} from '../actions/viewerAccount'

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
      messageOfTheDay={this.props.messageOfTheDay}
      account={this.props.account}
      signIn={this._boundSignIn}
      signUp={this._boundSignUp}
      signOut={this._boundSignOut}
      logout={this._boundLogout}
    />
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

export default connect(mapStateToProps, mapDispatchToProps)(TopBarContainer)
