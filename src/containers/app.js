/*
 * Entry-point into the app on the client side
 *
 */

import React from 'react'
import { connect } from 'react-redux'

import { AppContainer, LoadableChatComponent } from '../components/main'
import LoginForm from './loginForm'
import PopupRenderer from '../components/popups/'
import Helmet from './helmet'
import TopMenuBar from './topMenuBar'

import {
  closePopup,
  isSignedIn,
  unlock,
  showResetPassword,
  changeEncryptionPassword,
  signIn,
  signUp,
  signOut
} from '../actions/viewerAccount'

import { getIsSignedIn } from '../selectors/viewer'
import { getIsLoggedIn } from '../selectors/session'
import { selectPopup, selectPopupData } from '../selectors/popup'

const Popups = React.memo(PopupRenderer)
const LoginFormContainer = React.memo(LoginForm)

class App extends React.PureComponent {
  componentDidMount () {
    if (process.env.NODE_ENV !== 'production') {
      if (this.props.isSignedIn) return // component was hot reloaded
    }

    this.props.getIsSignedIn()
  }

  render () {
    const isLoggedIn = this.props.isLoggedIn
    const mainSection = isLoggedIn
      ? <LoadableChatComponent />
      : <LoginFormContainer isSignedIn={this.props.isSignedIn} />

    return <AppContainer>
      <Helmet />
      {mainSection}
      <TopMenuBar />
      <Popups
        popup={this.props.popup}
        closePopup={this.props.closePopup}
        displayResetPassword={this.props.showResetPassword}
        data={this.props.popupData}
        signUp={this.props.signUp}
        signIn={this.props.signIn}
        unlock={this.props.unlock}
        signOut={this.props.signOut}
        changePassword={this.props.changeEncryptionPassword}
      />
    </AppContainer>
  }
}

const mapStateToProps = state => {
  return {
    isLoggedIn: getIsLoggedIn(state), // Avatar session
    isSignedIn: getIsSignedIn(state), // Viewer account
    popup: selectPopup(state),
    popupData: selectPopupData(state)
  }
}

const mapDispatchToProps = {
  closePopup,
  getIsSignedIn: isSignedIn,
  showResetPassword,
  changeEncryptionPassword,
  unlock,
  signIn, // For viewer-account (to sync)
  signUp,
  signOut
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
