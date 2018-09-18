import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: rgb(95, 95, 95);
  margin: 1em;
  padding: 1em;
  border-radius: .5em;
  box-shadow: .2em .2em .7em black;

  & > span, & > div {
    margin-top: .7em;
  }

  @supports (display: grid) {
    display: grid;
    grid-template-areas:
      "title title title"
      "name name-input name-input"
      "password password-input password-input"
      "grid grid-select grid-select"
      ". save login";
    grid-gap: .5em;
    text-align: left;

    & > span, & > div {
      margin-top: 0em;
    }
  }
`

const Title = styled.h3`
  grid-area: title;
  margin: .3em;
  text-align: center;
`

const Name = styled.span`
  grid-area: name;
`

const NameInput = styled.input`
  grid-area: name-input;
`

const Password = styled.span`
  grid-area: password;
`

const PasswordInput = styled.input`
  grid-area: password-input;
`

const Grid = styled.span`
  grid-area: grid;
`

const GridSelect = styled.select`
  grid-area: grid-select;
`

const SaveNew = styled.div`
  grid-area: save;
`

const LoginButton = styled.button`
  grid-area: login;
`

export default class NewAvatarLogin extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      password: '',
      grid: 'Second Life',
      save: false
    }

    this._boundName = this._inInputChange.bind(this, 'name')
    this._boundPassword = this._inInputChange.bind(this, 'password')
    this._boundGridChange = this._inInputChange.bind(this, 'grid')
    this._boundSaveChange = this._saveChange.bind(this)
    this._boundLogin = this._onLogin.bind(this)
    this._boundKeyUp = this._onKeyUp.bind(this)
  }

  componentDidMount () {
    this.setState({
      save: this.props.isSignedIn
    })
  }

  componentWillReceiveProps (nextProps) {
    if (
      this.props.isSignedIn !== nextProps.isSignedIn &&
      this.state.name.length === 0 &&
      this.state.password.length === 0
    ) {
      this.setState({
        save: nextProps.isSignedIn
      })
    }
  }

  _inInputChange (key, event) {
    this.setState({
      [key]: event.target.value
    })
  }

  _saveChange (event) {
    this.setState({
      save: event.target.checked
    })
  }

  _onLogin (event) {
    if (event && event.preventDefault) {
      event.preventDefault()
    }

    const name = this.state.name
    const password = this.state.password
    const grid = this.state.grid
    const save = this.state.save && this.props.isSignedIn

    this.props.onLogin(name, password, grid, save)
  }

  _onKeyUp (event) {
    if (event.keyCode === 13) {
      this._onLogin(event)
    }
  }

  render () {
    const grids = this.props.grids.map(grid => {
      const name = grid.get('name')
      return <option key={name} value={name}>
        {name}
      </option>
    })

    return <Container>
      <Title>Add avatar or login anonymously</Title>

      <Name>Avatar:</Name>
      <NameInput
        type='text'
        onChange={this._boundName}
        onKeyUp={this._boundKeyUp}
        disabled={this.props.isLoggingIn}
      />

      <Password>Password:</Password>
      <PasswordInput
        type='password'
        value={this.state.password}
        onChange={this._boundPassword}
        onKeyUp={this._boundKeyUp}
        disabled={this.props.isLoggingIn}
      />

      <Grid>Grid:</Grid>
      <GridSelect value={this.state.grid} onChange={this._boundGridChange}>
        {grids}
      </GridSelect>

      <SaveNew title="Save and sync this avatar and it's chats">
        <label htmlFor='saveNewAvatarButton'>Save / Add</label>
        <input
          id='saveNewAvatarButton'
          type='checkbox'
          onChange={this._boundSaveChange}
          checked={this.state.save}
          disabled={!this.props.isSignedIn || this.props.isLoggingIn}
        />
      </SaveNew>
      <LoginButton onClick={this._boundLogin} disabled={this.props.isLoggingIn}>
        {this.props.isLoggingIn === this.state.name ? 'Connecting ...' : 'Login'}
      </LoginButton>
    </Container>
  }
}
