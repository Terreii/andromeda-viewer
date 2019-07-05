import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

import AvatarName from '../../avatarName'
import { Button, Input } from '../formElements'

const Container = styled.form`
  display: flex;
  flex-direction: column;
  background-color: rgb(110, 110, 110);
  margin: 1em;
  padding: 1em;
  max-width: calc(100vw - 2em);
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

  &.not-selected:focus {
    outline: 2px solid highlight;
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

const PasswordInfo = styled.label`
  grid-area: password;
  margin-top: .5em;
  
  @supports (display: grid) {
    margin-top: 0em;
  }
`

const PasswordInput = styled(Input)`
  grid-area: password-input;

  &:invalid {
    outline: 1px solid red;
  }
`

const LoginButton = styled(Button)`
  grid-area: login;
  margin-top: .7em;
  
  @supports (display: grid) {
    margin-top: 0em;
  }
`

export default function AvatarLogin ({ avatar, grid, isLoggingIn, onLogin, isSelected, onSelect }) {
  const [password, setPassword] = useState('')
  useEffect(() => {
    setPassword('')
  }, [isSelected])

  if (!isSelected) {
    const onSetActive = event => {
      event.preventDefault()
      onSelect(avatar.avatarIdentifier)
    }

    return <Container
      onClick={onSetActive}
      onKeyUp={event => {
        if (event.keyCode === 13 || event.keyCode === 32) {
          onSetActive(event)
        }
      }}
      className='not-selected'
      tabIndex='0'
    >
      <Name>{new AvatarName(avatar.name).getDisplayName()}</Name>
      <Grid>@{grid.name}</Grid>

      <ActiveText>click to login</ActiveText>
    </Container>
  }

  const onClick = event => {
    event.preventDefault()

    if (password.length > 0) {
      onLogin(avatar, password)
    }
  }

  const onKeyUp = event => {
    if (event.keyCode === 13) {
      onClick(event)
    }
  }

  const avatarName = new AvatarName(avatar.name).getDisplayName()
  const passwordInputId = `passwordFor${avatar.avatarIdentifier}`

  return <Container className='selected'>
    <Name>{avatarName}</Name>
    <Grid>@{grid.name}</Grid>

    <PasswordInfo htmlFor={passwordInputId}>Password:</PasswordInfo>
    <PasswordInput
      id={passwordInputId}
      type='password'
      className='medium'
      value={password}
      onChange={event => { setPassword(event.target.value) }}
      onKeyUp={onKeyUp}
      required
      autoFocus
      disabled={isLoggingIn}
      aria-label={'password for ' + avatarName}
      onFocus={event => {
        const target = event.target

        setTimeout(() => {
          if (target == null) return

          target.parentElement.scrollIntoView(true)
        }, 16)
      }}
    />

    <LoginButton
      onClick={onClick}
      disabled={isLoggingIn || password.length === 0}
    >
      {isLoggingIn === avatar.name ? 'Connecting ...' : 'Login'}
    </LoginButton>
  </Container>
}
