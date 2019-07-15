import React, { useState, useEffect } from 'react'
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

const ErrorOut = styled.p`
  background-color: rgb(215, 0, 0);
  border-radius: 0.3em;
  margin-top: 0.3em;
  padding: 0.3em;
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

export default function LoginForm ({ isSignedIn, avatars, grids, login, showSignInPopup }) {
  const [selected, setSelected] = useState(() => avatars.length === 0
    ? 'new'
    : avatars[0].avatarIdentifier
  )
  useEffect(() => {
    if (avatars.length > 0 && selected === 'new') {
      setSelected(avatars[0].avatarIdentifier)
    } else if (avatars.length === 0) {
      setSelected('new')
    }
    // only call effect on mount and if avatars switch between having some and none.
    // eslint-disable-next-line
  }, [avatars.length > 0])

  const [errorMessage, setErrorMessage] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(null)

  const doLogin = async (name, password, gridName, save, isNew) => {
    try {
      if (name.length === 0) {
        setErrorMessage('Please enter a name!')
        return
      }

      if (password.length === 0) {
        setErrorMessage('Please enter a password!')
        return
      }

      const grid = typeof gridName === 'string'
        ? grids.find(grid => grid.name === gridName)
        : gridName
      if (grid == null) {
        setErrorMessage(`Unknown Grid! The Grid ${gridName} isn't in the grid-list!`)
        return
      }

      const gridData = {
        name: grid.name,
        url: grid.url || grid.loginURL
      }

      const avatarName = new AvatarName(name)
      setIsLoggingIn(name)

      await login(avatarName, password, gridData, save, isNew)
    } catch (err) {
      console.error(err)
      // Displays the error message from the server
      setIsLoggingIn(null)
      setErrorMessage(err.message || err.toString())
    }
  }

  // Login with new or an anonym avatar.
  const loginAnonymously = (name, password, gridName, save) => {
    doLogin(name, password, gridName, save, true)
  }

  const loginWithSavedAvatar = (avatar, password) => {
    const name = avatar.name
    const gridName = avatar.grid

    doLogin(name, password, gridName, true, false)
  }

  return <Container>
    <Main>
      <AvatarsList>
        <LoginNewAvatar
          grids={grids}
          isSignedIn={isSignedIn}
          onLogin={loginAnonymously}
          isLoggingIn={isLoggingIn}
          isSelected={selected === 'new'}
          onSelect={setSelected}
        />

        {isSignedIn
          ? null
          : <SignIn showSignInPopup={showSignInPopup} />}

        {avatars.map(avatar => <AvatarLogin
          key={avatar._id}
          avatar={avatar}
          grid={grids.find(grid => grid.name === avatar.grid)}
          onLogin={loginWithSavedAvatar}
          isLoggingIn={isLoggingIn}
          isSelected={selected === avatar.avatarIdentifier}
          onSelect={setSelected}
        />)}
      </AvatarsList>

      <ErrorOut show={errorMessage.length !== 0}>
        {errorMessage}
      </ErrorOut>
    </Main>
  </Container>
}
