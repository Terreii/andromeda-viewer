import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { selectSavedAvatars, selectSavedGrids } from '../../bundles/account'

import { login } from '../../actions/sessionActions'

import AvatarName from '../../avatarName'
import AvatarLogin from './avatarLogin'
import LoginNewAvatar from './newAvatarLogin'
import SignIn from './signIn'

import styles from './index.module.css'

export default function LoginForm ({ isSignedIn }) {
  const dispatch = useDispatch()

  const history = useHistory()
  const avatars = useSelector(selectSavedAvatars)
  const grids = useSelector(selectSavedGrids)

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

      const avatarName = new AvatarName(name)
      setIsLoggingIn(name)

      await dispatch(login(avatarName, password, grid, save, isNew))
      history.push('/session')
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

  return <div className={styles.Container}>
    <main className={styles.Main}>
      <div className={styles.AvatarList}>
        <LoginNewAvatar
          grids={grids}
          isSignedIn={isSignedIn}
          onLogin={loginAnonymously}
          isLoggingIn={isLoggingIn}
          isSelected={selected === 'new'}
          onSelect={setSelected}
        />

        {!isSignedIn && <SignIn />}

        {avatars.map(avatar => <AvatarLogin
          key={avatar._id}
          avatar={avatar}
          grid={grids.find(grid => grid.name === avatar.grid)}
          onLogin={loginWithSavedAvatar}
          isLoggingIn={isLoggingIn}
          isSelected={selected === avatar.avatarIdentifier}
          onSelect={setSelected}
        />)}
      </div>

      {errorMessage && <div className={styles.ErrorOut}>
        {errorMessage.title.length > 0 && <h4>{errorMessage.title}</h4>}
        <p>
          {errorMessage.body.split('\n').map((line, index) => <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>)}
        </p>
      </div>}

      <footer className={styles.legalFooter}>
        <small>
          This software is not provided or supported by Linden Lab, the makers of Second Life.
        </small>
      </footer>
    </main>
  </div>
}
