import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import Popup from './popup'

const Content = styled.div`
  display: flex;
  flex-direction: column;
`

const ErrorOut = styled.span`
  margin-top: 0.5em;
  padding: .3em;
  border-radius: 0.3em;
  background-color: rgb(227, 0, 0);

  display: ${props => props.hasError ? '' : 'none'};
`

const PasswordRow = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 1.7em;

  & > input {
    flex: auto;
    margin-left: 2em;
  }
`

const ButtonsRow = styled.div`
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  margin-top: .7em;
  padding: .5em;
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
        this.setState({
          isUnlocking: false,
          errorText: error.toString()
        })
      })
  }

  render () {
    return <Popup title={'Unlock'}>
      <Content>
        <span>Please enter your Password to unlock this app!</span>
        <ErrorOut hasError={this.state.errorText != null}>{this.state.errorText}</ErrorOut>
        <PasswordRow>
          Password:
          <input
            type='password'
            autoComplete='current-password'
            disabled={this.state.isUnlocking}
            value={this.state.password}
            onChange={this._boundChange}
            onKeyUp={this._boundInput}
          />
        </PasswordRow>
        <ButtonsRow>
          <button
            onClick={this._boundUnlock}
            disabled={this.state.isUnlocking}
          >
            unlock
          </button>
          <button
            onClick={this.props.onSignOut}
            disabled={this.state.isUnlocking}
          >
            Sign out
          </button>
        </ButtonsRow>
      </Content>
    </Popup>
  }
}

UnlockDialog.propTypes = {
  onUnlock: PropTypes.func.isRequired,
  onSignOut: PropTypes.func.isRequired
}
