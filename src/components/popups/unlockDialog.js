import React from 'react'
import PropTypes from 'prop-types'

import Popup from './popup'

import styles from './unlockDialog.module.css'
import formStyles from '../formElements.module.css'
import lockIcon from '../../icons/black_lock.svg'

export default class UnlockDialog extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      password: '',
      isUnlocking: false,
      errorText: null
    }

    this._boundInput = this._onKeyInputPressed.bind(this)
    this._boundUnlock = this._onUnlock.bind(this)
    this._boundChange = this._onChange.bind(this)
  }

  _onKeyInputPressed (event) {
    if (event.keyCode === 13) {
      this._onUnlock()
    }
  }

  _onChange (event) {
    this.setState({
      password: event.target.value
    })
  }

  _onUnlock (event) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault()
    }

    const password = this.state.password
    if (password.length === 0) {
      this.setState({
        errorText: 'No password was entered jet!'
      })
      return
    }

    this.setState({
      isUnlocking: true
    })

    this.props.onUnlock(password)

      .catch(error => {
        console.error(error)
        const errorText = typeof error.message === 'string'
          ? error.message
          : error.toString()

        this.setState({
          isUnlocking: false,
          errorText
        })
      })
  }

  render () {
    const title = <span>
      <img
        className={styles.LockItem}
        src={lockIcon}
        height='18'
        width='18'
        alt=''
      />
      Unlock
    </span>

    return <Popup title={title}>
      <form className={styles.Content}>
        <span>Please enter your <i>Encryption-Password</i> to unlock this app!</span>

        <div className={styles.PasswordRow}>
          <label htmlFor='unlockPasswordIn'>Password:</label>
          <input
            id='unlockPasswordIn'
            type='password'
            className={formStyles.Input}
            autoComplete='current-password'
            autoFocus
            disabled={this.state.isUnlocking}
            value={this.state.password}
            onChange={this._boundChange}
            onKeyUp={this._boundInput}
            aria-describedby='resetPassword'
          />
          <small id='resetPassword' className={formStyles.Help}>
            If you did forget your encryption-password?
            <button
              id='resetPasswordButton'
              className={styles.ResetButton}
              onClick={() => { this.props.onForgottenPassword('encryption') }}
            >
              Reset password
            </button>
          </small>
          <small
            id='unlockError'
            className={formStyles.Error}
            data-hide={this.state.errorText == null}
            role='alert'
          >
            {this.state.errorText}
          </small>
        </div>
        <div className={styles.ButtonsRow}>
          <button
            id='unlockButton'
            className={formStyles.PrimaryButton}
            onClick={this._boundUnlock}
            disabled={this.state.isUnlocking}
          >
            Unlock
          </button>
          <button
            id='signOutButton'
            className={formStyles.DangerButton}
            onClick={this.props.onSignOut}
            disabled={this.state.isUnlocking}
          >
            Sign out
          </button>
        </div>
      </form>
    </Popup>
  }
}

UnlockDialog.propTypes = {
  onUnlock: PropTypes.func.isRequired,
  onSignOut: PropTypes.func.isRequired
}
