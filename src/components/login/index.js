import React from 'react'
import styled from 'styled-components'

import LoginNewAvatar from './newAvatarLogin'
import AvatarLogin from './avatarLogin'
import SignIn from './signIn'
import AvatarName from '../../avatarName'

const Container = styled.div`
  overflow: scroll;
`

const Main = styled.div`
  background-color: rgb(77, 80, 85);
  color: rgb(255, 255, 255);
  border-radius: 1em;
  padding: 0.8em;
  max-width: 75vw;
  margin-top: 2em;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 0.5em;
  text-align: center;
  display: flex;
  flex-direction: column;

  @media (max-width: 750px) {
    background-color: rgba(0, 0, 0, 0);
    color: #000;
    margin-top: 0;
    padding-top: 0;
  }
`

const ErrorOut = styled.div`
  background-color: rgb(215, 0, 0);
  border-radius: 0.3em;
  margin-top: 0.3em;
  margin-left: auto;
  margin-right: auto;
  padding: 0.3em 1em;
  display: ${props => props.show ? '' : 'none'};
`

const AvatarsList = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;

  & > div {
    flex: fit-content;
  }

  @media (min-width: 750px) {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: start;
  }

  @supports (display: grid) {
    display: grid;
    grid-template-columns: repeat(auto-fit, 25em);
  }
`

export default class LoginForm extends React.Component {
  constructor () {
    super()
    this.state = {
      selected: 'new',
      errorMessage: null,
      isLoggingIn: false
    }

    this._boundSetSelected = this._setSelected.bind(this)
    this._boundLoginAnonymously = this._loginAnonymously.bind(this)
    this._boundLoginWithSavedAvatar = this._loginWithSavedAvatar.bind(this)
  }

  componentWillMount () {
    if (this.props.avatars.length > 0) {
      this._setSelected(this.props.avatars[0].avatarIdentifier)
    }
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.avatars.length === 0 && nextProps.avatars.length > 0) {
      this._setSelected(nextProps.avatars[0].avatarIdentifier)
    } else if (this.props.avatars.length > 0 && nextProps.avatars.length === 0) {
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
    const name = avatar.name
    const gridName = avatar.grid

    this._login(name, password, gridName, true, false)
  }

  async _login (name, password, gridName, save, isNew) {
    try {
      if (name.length === 0) {
        this._setError('No name!', 'Please enter a name!')
        return
      }

      if (password.length === 0) {
        this._setError('No password!', 'Please enter a password!')
        return
      }

      const grid = typeof gridName === 'string'
        ? this.props.grids.find(grid => grid.name === gridName)
        : gridName
      if (grid == null) {
        this._setError('Unknown Grid!', `The Grid ${gridName} isn't in the grid-list!`)
        return
      }

      const gridData = {
        isLoginLLSD: grid.isLoginLLSD || false,
        name: grid.name,
        url: grid.url || grid.loginURL
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
        isLoggingIn: false
      })
      this._parseErrorMessage(err)
    }
  }

  _setError (title, body) {
    if (title == null || body == null) {
      this.setState({ errorMessage: null })
      return
    }
    this.setState({
      errorMessage: {
        title,
        body
      }
    })
  }

  _parseErrorMessage (error) {
    try {
      const parser = new window.DOMParser()
      const errorBody = parser.parseFromString(error.message, 'text/html')

      const hasTitle = errorBody.body.children.length > 1 || [
        'H1',
        'H2',
        'H3',
        'H4',
        'H5',
        'H6',
        'H7'
      ].includes(errorBody.body.firstChild.nodeName)

      const title = hasTitle
        ? errorBody.body.firstChild.textContent
        : ''

      const messageElements = Array.prototype.slice.call(
        errorBody.body.childNodes,
        hasTitle ? 1 : 0
      )
      const body = messageElements.reduce((body, element, index) => {
        const textContent = element.textContent.trim()
        if (textContent.length === 0) return body

        return body + (index === 0 ? '' : '\n') + element.textContent
      }, '')

      this._setError(title, body)
    } catch (parseError) {
      console.error(parseError)
      this._setError('Login failed!', error.message)
    }
  }

  render () {
    const signInDialog = this.props.isSignedIn
      ? null
      : <SignIn showSignInPopup={this.props.showSignInPopup} />

    return <Container>
      <Main>
        <AvatarsList>
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
            key={avatar._id}
            avatar={avatar}
            grid={this.props.grids.find(grid => grid.name === avatar.grid)}
            onLogin={this._boundLoginWithSavedAvatar}
            isLoggingIn={this.state.isLoggingIn}
            isSelected={this.state.selected === avatar.avatarIdentifier}
            onSelect={this._boundSetSelected}
          />)}
        </AvatarsList>

        {this.state.errorMessage && <ErrorOut show>
          {this.state.errorMessage.title.length > 0 && <h4>{this.state.errorMessage.title}</h4>}
          <p>
            {this.state.errorMessage.body.split('\n').map((line, index) => <span key={index}>
              {line}
              <br />
            </span>)}
          </p>
        </ErrorOut>}
      </Main>
    </Container>
  }
}
