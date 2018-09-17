import React from 'react'
import styled from 'styled-components'

import AvatarName from '../../avatarName'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: rgb(110, 110, 110);
  margin: 1em;
  padding: 1em;
  border-radius: .5em;
  box-shadow: .2em .2em .7em black;

  @supports (display: grid) {
    display: grid;
    grid-template-areas:
      "name name grid-name"
      "password password-input password-input"
      ". login .";
    grid-gap: .5em;
    text-align: left;

    @media (max-width: 450px) {
      grid-template-areas:
        "name"
        "grid-name"
        "password"
        "password-input"
        "login";
      text-align: center;
    }
  }
`

const Name = styled.span`
  grid-area: name;
  font-size: 140%;
`

const Grid = styled.span`
  grid-area: grid-name;
`

const PasswordInfo = styled.span`
  grid-area: password;
  margin-top: .5em;
  
  @supports (display: grid) {
    margin-top: 0em;
  }
`

const PasswordInput = styled.input`
  grid-area: password-input;
`

const LoginButton = styled.button`
  grid-area: login;
  margin-top: .7em;
  
  @supports (display: grid) {
    margin-top: 0em;
  }
`

export default function AvatarLogin ({ avatar, grid, isLoggingIn = false, onLogin }) {
  const ref = React.createRef()

  const onClick = event => {
    event.preventDefault()

    const password = ref.current.value
    onLogin(avatar, password)
  }

  const onKeyUp = event => {
    if (event.keyCode === 13) {
      onClick(event)
    }
  }

  return <Container>
    <Name>{new AvatarName(avatar.get('name')).getDisplayName()}</Name>
    <Grid>@{grid.get('name')}</Grid>

    <PasswordInfo>Password:</PasswordInfo>
    <PasswordInput
      type='password'
      innerRef={ref}
      onKeyUp={onKeyUp}
      disabled={isLoggingIn}
    />

    <LoginButton
      onClick={onClick}
      disabled={isLoggingIn}
    >
      {isLoggingIn === avatar.get('name') ? 'Connecting ...' : 'Login'}
    </LoginButton>
  </Container>
}
