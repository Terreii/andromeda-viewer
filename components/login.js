'use strict'

import React from 'react'

import AvatarName from '../avatarName'
import { viewerName } from '../viewerInfo'
import { login } from '../session'

import style from './login.css'

// Show the name of the Viewer
document.title = viewerName

export default class LoginForm extends React.Component {
  constructor () {
    super()
    this.state = {
      name: '',
      password: '',
      save: false,
      errorMessage: '',
      gridIndex: 0,
      isLoggingIn: false
    }
    this._boundNameChange = this._nameChanged.bind(this)
    this._boundPasswordChange = this._passwordChanged.bind(this)
    this._boundLoginAnonymously = this._loginAnonymously.bind(this)
    this._boundDetectReturn = this._detectReturn.bind(this)
    this._boundGridChange = this._gridChange.bind(this)
    this._boundAddGrid = this._addGrid.bind(this)
  }

  _nameChanged (event) {
    const name = event.target.value || ''
    this.setState({
      name
    })
  }

  _passwordChanged (event) {
    const password = event.target.value || ''
    this.setState({
      password
    })
  }

  _detectReturn (event) { // detects if return was pressed (keyCode 13)
    if (event.type === 'keyup' && (
      event.which === 13 || event.keyCode === 13)
    ) {
      this._loginAnonymously(event)
    }
  }

  _gridChange (event) {
    const nextIndex = +event.target.value || 0
    this.setState({
      gridIndex: nextIndex
    })
  }

  _addGrid (event) {
    const nameInput = document.getElementById('newGridName')
    const urlInput = document.getElementById('newGridURL')
    const name = nameInput.value
    const url = urlInput.value
    if (name.length === 0 || url.length === 0) return
    this.props.saveGrid(name, url)
    nameInput.value = ''
    urlInput.value = ''
  }

  // Login with new or an anonym avatar.
  _loginAnonymously (event) {
    if (this.state.name.length === 0) {
      this.setState({
        errorMessage: 'Please enter a name'
      })
      return
    }
    if (this.state.password.length === 0) {
      this.setState({
        errorMessage: 'Please enter a password'
      })
      return
    }
    this.setState({
      isLoggingIn: true
    })
    const {first, last} = new AvatarName(this.state.name)
    const grid = this.props.grids.get(this.state.gridIndex)
    if (grid == null) return

    this._login(first, last, this.state.password, grid).then(() => {
      if (this.state.save && this.props.isSignedIn) {
        this.props.saveAvatar(new AvatarName(first, last), grid)
      }
    }).catch(err => {
      // Displays the error message from the server
      console.error(err)
      this.setState({
        errorMessage: err.message,
        isLoggingIn: false
      })
    })
  }

  // Login with an already saved avatar.
  _loginWithSavedAvatar (avatar, password) {
    if (password.length === 0) return
    const name = avatar.get('name')
    const {first, last} = new AvatarName(name)

    const gridName = avatar.get('grid')
    const grid = this.props.grids.find(aGrid => aGrid.get('name') === gridName)
    if (grid == null) return

    this._login(first, last, password, grid).catch(error => {
      console.error(error)
      this.setState({
        errorMessage: error.message
      })
    })
  }

  _login (firstName, lastName, password, grid) {
    const gridData = {
      name: grid.get('name'),
      url: grid.get('loginURL')
    }
    return login(firstName, lastName, password, gridData).then(res => {
      this.props.onLogin(true)
    })
  }

  renderAvatarLogin () {
    if (this.props.avatars == null) return null
    return this.props.avatars.map(avatar => {
      const name = avatar.get('name')
      const passwordId = 'password' + name
      const displayName = new AvatarName(name).getName()
      return <div key={avatar.get('_id')} className={style.SavedAvatarLogin}>
        <h3>{displayName}</h3>
        <input type='password' id={passwordId} placeholder='password' />
        <div>
          <button onClick={event => {
            const password = document.getElementById(passwordId).value
            this._loginWithSavedAvatar(avatar, password)
          }}>
            Login
          </button>
        </div>
      </div>
    })
  }

  render () {
    const displayError = this.state.errorMessage.length === 0
      ? 'none'
      : ''
    const grids = this.props.grids.map((grid, index) => {
      const name = grid.get('name')
      return <option key={name} value={index}>{name}</option>
    })
    return <div className={style.Main}>
      <h1>
        {'Login to '}
        <span className={style.ViewerName}>
          {viewerName}
        </span>
      </h1>
      <div>
        <input
          type='text'
          id='loginName'
          placeholder='Avatar Name'
          autoComplete='username'
          value={this.state.name}
          onChange={this._boundNameChange}
          onKeyUp={this._boundDetectReturn}
          />
      </div>
      <div>
        <input
          type='password'
          id='loginPassword'
          placeholder='Password'
          autoComplete='current-password'
          value={this.state.password}
          onChange={this._boundPasswordChange}
          onKeyUp={this._boundDetectReturn}
          />
      </div>
      <div>
        <select value={this.state.gridIndex} onChange={this._boundGridChange}>
          {grids}
        </select>
      </div>
      <div>
        <input
          id='saveAvatar'
          type='checkbox'
          checked={this.state.save}
          onChange={event => this.setState({
            save: event.target.checked
          })}
          />
        <label htmlFor='saveAvatar'>Save</label>
      </div>
      <div>
        <input
          type='button'
          value={this.state.isLoggingIn ? 'Connecting ...' : 'Login'}
          onClick={this._boundLoginAnonymously}
          disabled={this.state.isLoggingIn}
          />
      </div>
      <div className={style.SavedAvatars}>
        {this.renderAvatarLogin()}
      </div>
      <p className={style.Error} style={{display: displayError}}>
        {this.state.errorMessage}
      </p>
      <div>
        Add Grid:
        <br />
        <input id='newGridName' type='text' placeholder='Grid Name' />
        <input id='newGridURL' type='url' placeholder='Grid Login URL' />
        <br />
        <input type='button' value='add' onClick={this._boundAddGrid} />
      </div>
    </div>
  }
}
