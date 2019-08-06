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

  const [errorMessage, setErrorMessageState] = useState(null)
  const setErrorMessage = (title, body) => {
    if (title == null || body == null) {
      setErrorMessageState(null)
    } else {
      setErrorMessageState({ title, body })
    }
  }
  const [isLoggingIn, setIsLoggingIn] = useState(null)

  const parseErrorMessage = error => {
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

      setErrorMessage(title, body)
    } catch (parseError) {
      console.error(parseError)
      setErrorMessage('Login failed!', error.message)
    }
  }

  const doLogin = async (name, password, gridName, save, isNew) => {
    try {
      if (name.length === 0) {
        setErrorMessage('No name!', 'Please enter a name!')
        return
      }

      if (password.length === 0) {
        setErrorMessage('No password!', 'Please enter a password!')
        return
      }

      const grid = typeof gridName === 'string'
        ? grids.find(grid => grid.name === gridName)
        : gridName
      if (grid == null) {
        setErrorMessage('Unknown Grid!', `The Grid ${gridName} isn't in the grid-list!`)
        return
      }

      const gridData = {
        isLoginLLSD: grid.isLoginLLSD || false,
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
      parseErrorMessage(err)
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

      {errorMessage && <ErrorOut show>
        {errorMessage.title.length > 0 && <h4>{errorMessage.title}</h4>}
        <p>
          {errorMessage.body.split('\n').map((line, index) => <span key={index}>
            {line}
            <br />
          </span>)}
        </p>
      </ErrorOut>}
    </Main>
  </Container>
}
