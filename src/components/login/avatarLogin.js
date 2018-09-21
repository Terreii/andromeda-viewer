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
  box-shadow: 0.2em 0.2em 0.4em 0.1em black;

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

  &.not-selected {
    cursor: pointer;
    background-color: rgb(95, 95, 95);
    box-shadow: 0.1em 0.1em 0.3em 0px black;
  }
`

const Name = styled.span`
  grid-area: name;
  font-size: 140%;
  white-space: nowrap;
`

const Grid = styled.span`
  grid-area: grid-name;
  white-space: nowrap;
`

const ActiveText = styled.span`
  grid-area: password / password / password-input-end / password-input-end;
  text-align: center;
  color: rgba(255, 255, 255, .7);
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

  &:invalid {
    outline: 1px solid red;
  }
`

const LoginButton = styled.button`
  grid-area: login;
  margin-top: .7em;
  
  @supports (display: grid) {
    margin-top: 0em;
  }
`

export default function AvatarLogin ({ avatar, grid, isLoggingIn, onLogin, isSelected, onSelect }) {
  if (!isSelected) {
    const onSetActive = event => {
      event.preventDefault()
      const avID = avatar.get('avatarIdentifier')
      onSelect(avID)
    }

    return <Container onClick={onSetActive} className='not-selected'>
      <Name>{new AvatarName(avatar.get('name')).getDisplayName()}</Name>
      <Grid>@{grid.get('name')}</Grid>

      <ActiveText>click to login</ActiveText>
    </Container>
  }

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

  return <Container className='selected'>
    <Name>{new AvatarName(avatar.get('name')).getDisplayName()}</Name>
    <Grid>@{grid.get('name')}</Grid>

    <PasswordInfo>Password:</PasswordInfo>
    <PasswordInput
      type='password'
      innerRef={ref}
      onKeyUp={onKeyUp}
      required
      autoFocus
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
