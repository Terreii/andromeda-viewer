import { useState, useEffect, Fragment } from 'react'
import { useHistory } from 'react-router-dom'

import { selectSavedAvatars, selectGridsByName } from '../../bundles/account'
import { parseNameString } from '../../bundles/names'

import { login } from '../../actions/sessionActions'
import { useSelector, useDispatch } from '../../hooks/store'

import LoginNewAvatar from './newAvatarLogin'
import AvatarLogin from './avatarLogin'
import SignIn from './signIn'

export default function LoginForm ({ isSignedIn }) {
  const dispatch = useDispatch()

  const history = useHistory()
  const avatars = useSelector(selectSavedAvatars)
  const grids = useSelector(selectGridsByName)

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
        ? grids[gridName]
        : gridName
      if (grid == null) {
        setErrorMessage('Unknown Grid!', `The Grid ${gridName} isn't in the grid-list!`)
        return
      }

      const avatarName = parseNameString(name)
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

  return (
    <div className='mt-10 overflow-scroll'>
      <main
        className='flex flex-col max-w-screen-lg mx-auto my-0 text-center text-white md:mt-8 md:mb-2'
      >
        <div
          className='flex flex-col flex-wrap items-center justify-center md:grid md:items-start lg:grid-cols-3 md:grid-cols-2 md:flex-row'
        >
          <LoginNewAvatar
            isSignedIn={isSignedIn}
            onLogin={loginAnonymously}
            isLoggingIn={isLoggingIn}
            isSelected={selected === 'new'}
            onSelect={setSelected}
          />

          {!isSignedIn && <SignIn />}

          {avatars.map(avatar => (
            <AvatarLogin
              key={avatar._id}
              avatar={avatar}
              grid={grids[avatar.grid]}
              onLogin={loginWithSavedAvatar}
              isLoggingIn={isLoggingIn}
              isSelected={selected === avatar.avatarIdentifier}
              onSelect={setSelected}
            />
          ))}
        </div>

        {errorMessage && (
          <div className='p-4 mx-auto mt-1 bg-red-700 rounded'>
            {errorMessage.title.length > 0 && <h4>{errorMessage.title}</h4>}
            <p>
              {errorMessage.body.split('\n').map((line, index) => (
                <Fragment key={index}>
                  {line}
                  <br />
                </Fragment>
              ))}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
