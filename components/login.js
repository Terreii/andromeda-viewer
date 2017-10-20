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
    this._boundLogin = this._login.bind(this)
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
      this._login(event)
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

  _login (event) {
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
    const grid = this.props.grids.get(this.state.gridIndex).toJSON()
    login(first, last, this.state.password, grid).then(res => {
      this.props.onLogin(true)
    }).then(() => {
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

  renderAvatarLogin (avatar) {
    return <div key={avatar.get('_id')}>
      <h3>{avatar.get('name')}</h3>
      <input type='password' id={'password' + avatar.name} placeholder='password' />
      <button onClick={event => console.log(event)}>Login</button>
    </div>
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
          onClick={this._boundLogin}
          disabled={this.state.isLoggingIn}
          />
      </div>
      <div style={{display: 'flex', flexDirection: 'row'}}>
        {this.props.avatars != null ? this.props.avatars.map(this.renderAvatarLogin.bind(this)) : null}
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
