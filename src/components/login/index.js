import React from 'react'
import styled from 'styled-components'

import LoginNewAvatar from './newAvatarLogin'
import AvatarLogin from './avatarLogin'
import AvatarName from '../../avatarName'
import { viewerName } from '../../viewerInfo'

const Main = styled.div`
  background-color: rgb(77, 80, 85);
  color: rgb(255, 255, 255);
  border-radius: 1em;
  padding: 0.8em;
  max-width: 30em;
  margin-top: 2em;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  display: flex;
  flex-direction: column;
`

const ViewerNameCapitalizer = styled.span`
  text-transform: capitalize;
`

const ErrorOut = styled.p`
  background-color: rgb(255, 0, 0);
  border-radius: 0.3em;
  margin-top: 0.3em;
  padding: 0.3em;
  display: ${props => props.show ? '' : 'none'};
`

const SavedAvatarsList = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`

export default class LoginForm extends React.Component {
  constructor () {
    super()
    this.state = {
      errorMessage: '',
      isLoggingIn: false
    }

    this._boundLoginAnonymously = this._loginAnonymously.bind(this)
    this._boundLoginWithSavedAvatar = this._loginWithSavedAvatar.bind(this)
    this._boundAddGrid = this._addGrid.bind(this)
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
  _loginAnonymously (name, password, gridName, save) {
    this._login(name, password, gridName, save, true)
  }

  // Login with an already saved avatar.
  _loginWithSavedAvatar (avatar, password) {
    const name = avatar.get('name')
    const gridName = avatar.get('grid')

    this._login(name, password, gridName, true)
  }

  async _login (name, password, gridName, save, isNew = false) {
    try {
      if (name.length === 0) {
        this.setState({
          errorMessage: 'Please enter a name'
        })
        return
      }

      if (password.length === 0) {
        this.setState({
          errorMessage: 'Please enter a password'
        })
        return
      }

      const grid = this.props.grids.find(grid => grid.get('name') === gridName)
      if (grid == null) {
        this.setState({
          errorMessage: `Unknown Grid! The Grid ${gridName} isn't in the grid-list!`
        })
        return
      }

      const gridData = {
        name: grid.get('name'),
        url: grid.get('loginURL')
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
    return <Main>
      <h1>
        {'Login to '}
        <ViewerNameCapitalizer>
          {viewerName}
        </ViewerNameCapitalizer>
      </h1>

      <LoginNewAvatar
        grids={this.props.grids}
        isSignedIn={this.props.isSignedIn}
        onLogin={this._boundLoginAnonymously}
        isLoggingIn={this.state.isLoggingIn}
      />

      <SavedAvatarsList>
        {this.props.avatars.map(avatar => <AvatarLogin
          key={avatar.get('_id')}
          avatar={avatar}
          grid={this.props.grids.find(grid => grid.get('name') === avatar.get('grid'))}
          onLogin={this._boundLoginWithSavedAvatar}
          isLoggingIn={this.state.isLoggingIn}
        />)}
      </SavedAvatarsList>

      <ErrorOut show={this.state.errorMessage.length !== 0}>
        {this.state.errorMessage}
      </ErrorOut>
      <div>
        Add Grid:
        <br />
        <input id='newGridName' type='text' placeholder='Grid Name' />
        <input id='newGridURL' type='url' placeholder='Grid Login URL' />
        <br />
        <input type='button' value='add' onClick={this._boundAddGrid} />
      </div>
    </Main>
  }
}
