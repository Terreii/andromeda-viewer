import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import Popup from './popup'
import { Button, FormField, Input, Help } from '../formElements'

import lockIcon from '../../icons/black_lock.svg'

const Content = styled.div`
  display: flex;
  flex-direction: column;
`

const LockItemStyled = styled.img`
  position: relative;
  left: -10%;
  margin: 0px;
  margin-right: 0.3em;
`

const PasswordRow = styled(FormField)`
  margin-top: 0.75em;
`

const ButtonsRow = styled.div`
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  margin-top: .7em;
  padding: .25em 0em;

  & > button + button {
    margin-right: 2.75em;
  }
`

const ResetButton = styled.button`
  border: 0px;
  background: none;
  color: blue;
  text-decoration: underline;
  display: inline;
  padding: 0;
  padding-left: 1em;
  margin: 0;
  cursor: pointer;
`

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
      <LockItemStyled
        src={lockIcon}
        height='18'
        width='18'
        alt=''
      />
      Unlock
    </span>

    return <Popup title={title}>
      <Content>
        <span>Please enter your <i>Encryption-Password</i> to unlock this app!</span>

        <PasswordRow>
          <label htmlFor='unlockPasswordIn'>Password:</label>
          <Input
            id='unlockPasswordIn'
            type='password'
            autoComplete='current-password'
            autoFocus
            disabled={this.state.isUnlocking}
            value={this.state.password}
            onChange={this._boundChange}
            onKeyUp={this._boundInput}
            aria-describedby='resetPassword'
          />
          <Help id='resetPassword'>
            If you did forget your encryption-password?
            <ResetButton
              id='resetPasswordButton'
              onClick={() => { this.props.onForgottenPassword('encryption') }}
            >
              Reset password
            </ResetButton>
          </Help>
          <Help id='unlockError' className='Error' hide={this.state.errorText == null} role='alert'>
            {this.state.errorText}
          </Help>
        </PasswordRow>
        <ButtonsRow>
          <Button
            id='unlockButton'
            className='primary'
            onClick={this._boundUnlock}
            disabled={this.state.isUnlocking}
          >
            Unlock
          </Button>
          <Button
            id='signOutButton'
            className='danger'
            onClick={this.props.onSignOut}
            disabled={this.state.isUnlocking}
          >
            Sign out
          </Button>
        </ButtonsRow>
      </Content>
    </Popup>
  }
}

UnlockDialog.propTypes = {
  onUnlock: PropTypes.func.isRequired,
  onSignOut: PropTypes.func.isRequired
}
