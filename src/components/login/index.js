import React from 'react'

import LoginNewAvatar from './newAvatarLogin'
import AvatarLogin from './avatarLogin'
import SignIn from './signIn'
import AvatarName from '../../avatarName'

import styles from './index.module.css'

export default class LoginForm extends React.Component {
  constructor () {
    super()
    this.state = {
      selected: 'new',
      errorMessage: '',
      isLoggingIn: false
    }

    this._boundSetSelected = this._setSelected.bind(this)
    this._boundLoginAnonymously = this._loginAnonymously.bind(this)
    this._boundLoginWithSavedAvatar = this._loginWithSavedAvatar.bind(this)
  }

  componentWillMount () {
    if (this.props.avatars.size > 0) {
      this._setSelected(this.props.avatars.getIn([0, 'avatarIdentifier']))
    }
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.avatars.size === 0 && nextProps.avatars.size > 0) {
      this._setSelected(nextProps.avatars.getIn([0, 'avatarIdentifier']))
    } else if (this.props.avatars.size > 0 && nextProps.avatars.size === 0) {
      this._setSelected('new')
    }
  }

  _setSelected (avatarIdentifier) {
    this.setState({
      selected: avatarIdentifier
    })
  }

  // Login with new or an anonym avatar.
  _loginAnonymously (name, password, gridName, save) {
    this._login(name, password, gridName, save, true)
  }

  // Login with an already saved avatar.
  _loginWithSavedAvatar (avatar, password) {
    const name = avatar.get('name')
    const gridName = avatar.get('grid')

    this._login(name, password, gridName, true, false)
  }

  async _login (name, password, gridName, save, isNew) {
    try {
      if (name.length === 0) {
        this.setState({
          errorMessage: 'Please enter a name!'
        })
        return
      }

      if (password.length === 0) {
        this.setState({
          errorMessage: 'Please enter a password!'
        })
        return
      }

      const grid = typeof gridName === 'string'
        ? this.props.grids.find(grid => grid.get('name') === gridName)
        : gridName
      if (grid == null) {
        this.setState({
          errorMessage: `Unknown Grid! The Grid ${gridName} isn't in the grid-list!`
        })
        return
      }

      const gridData = {
        name: grid.name || grid.get('name'),
        url: grid.url || grid.get('loginURL')
      }

      const avatarName = new AvatarName(name)
      this.setState({
        isLoggingIn: name
      })

      await this.props.login(avatarName, password, gridData, save, isNew)
    } catch (err) {
      console.error(err)
      // Displays the error message from the server
      this.setState({
        isLoggingIn: false,
        errorMessage: err.message
      })
    }
  }

  render () {
    const signInDialog = this.props.isSignedIn
      ? null
      : <SignIn showSignInPopup={this.props.showSignInPopup} />

    return <div className={styles.Container}>
      <main className={styles.Main}>
        <div className={styles.AvatarList}>
          <LoginNewAvatar
            grids={this.props.grids}
            isSignedIn={this.props.isSignedIn}
            onLogin={this._boundLoginAnonymously}
            isLoggingIn={this.state.isLoggingIn}
            isSelected={this.state.selected === 'new'}
            onSelect={this._boundSetSelected}
          />

          {signInDialog}

          {this.props.avatars.map(avatar => <AvatarLogin
            key={avatar.get('_id')}
            avatar={avatar}
            grid={this.props.grids.find(grid => grid.get('name') === avatar.get('grid'))}
            onLogin={this._boundLoginWithSavedAvatar}
            isLoggingIn={this.state.isLoggingIn}
            isSelected={this.state.selected === avatar.get('avatarIdentifier')}
            onSelect={this._boundSetSelected}
          />)}
        </div>

        <p className={styles.ErrorOut} data-show={this.state.errorMessage.length !== 0}>
          {this.state.errorMessage}
        </p>
      </main>
    </div>
  }
}
