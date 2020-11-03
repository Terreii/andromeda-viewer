import { useState, useEffect, useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'

import { selectSavedGrids } from '../../bundles/account'

import { useAutoFocus } from '../../hooks/utils'

export default function NewAvatarLogin ({
  isSelected,
  isSignedIn,
  isLoggingIn,
  onSelect,
  onLogin
}) {
  const grids = useSelector(selectSavedGrids)

  const [name, isNameValid, onNameChange] = useInput('')
  const [password, isPwValid, onPasswordChange] = useInput('')

  const [saveAvatar, setSaveAvatar] = useState(isSignedIn)
  const lastIsSignedIn = useRef(isSignedIn)
  useEffect(() => {
    if (isSignedIn !== lastIsSignedIn.current && name.length === 0 && password.length === 0) {
      setSaveAvatar(isSignedIn)
      lastIsSignedIn.current = isSignedIn
    }
  }, [isSignedIn, lastIsSignedIn, name, password, setSaveAvatar])

  const [selectedGrid, setSelectedGrid] = useState('Second Life')
  const [gridName, isGridNameValid, onGridNameChange] = useInput('')
  const [gridUrl, isGridUrlValid, onGridUrlChange] = useInput('')
  const [isGridLLSD, setIsGridLLSD] = useState(true)

  const doAutoFocus = useAutoFocus()

  if (!isSelected) {
    return (
      <form
        className={'flex flex-col row-auto p-4 m-4 text-white bg-gray-700 rounded ' +
        'focus-within:shadow-outline'}
        onSubmit={event => {
          event.preventDefault()
          onSelect('new')
        }}
      >
        <button className='flex flex-col text-white btn-transparent focus:outline-none'>
          <h2 className='block m-1 text-xl text-center'>
            <span className='whitespace-no-wrap'>Add avatar</span>
            <span> or </span>
            <span className='whitespace-no-wrap'>login anonymously</span>
          </h2>

          <span className='text-center text-gray-400'>click to add</span>
        </button>
      </form>
    )
  }

  const isNewGrid = selectedGrid === ''

  const gridIsValid = !isNewGrid || (isGridNameValid && isGridUrlValid)

  const isValid = isNameValid && name.length > 1 && isPwValid && gridIsValid

  const doLogin = event => {
    event.preventDefault()

    if (!isValid) return

    const grid = selectedGrid !== ''
      ? selectedGrid
      : {
          name: gridName,
          loginUrl: gridUrl,
          isLoginLLSD: isGridLLSD
        }
    const save = saveAvatar && isSignedIn

    onLogin(name, password, grid, save)
  }

  return (
    <form
      className={'flex flex-col bg-gray-700 text-white m-4 p-4 rounded shadow ' + (isNewGrid
        ? 'row-span-3'
        : 'row-span-2'
      )}
      onSubmit={doLogin}
    >
      <h2 className='block m-1 text-xl text-center'>
        {isSignedIn && (
          <>
            <span className='whitespace-no-wrap'>Add avatar</span>
            <span> or </span>
          </>
        )}
        <span className='whitespace-no-wrap'>login anonymously</span>
      </h2>

      <label className='text-left'>
        <span>Avatar</span>
        <input
          type='text'
          className='block w-full mt-1 text-gray-900 form-input'
          value={name}
          onChange={onNameChange}
          disabled={isLoggingIn}
          minLength='1'
          placeholder='avatar name'
          required
          autoFocus
          ref={doAutoFocus}
          onFocus={event => {
            const target = event.target

            setTimeout(() => {
              if (
                target == null ||
                target.parentElement == null ||
                target.parentElement.scrollIntoView == null
              ) {
                return
              }

              target.parentElement.scrollIntoView(true)
            }, 16)
          }}
        />
      </label>

      <label className='mt-3 text-left'>
        <span>Password</span>
        <input
          type='password'
          className='block w-full mt-1 text-gray-900 form-input'
          value={password}
          onChange={onPasswordChange}
          disabled={isLoggingIn}
          minLength='2'
          required
        />
      </label>

      <label className='mt-3 text-left'>
        <span>Grid</span>
        <select
          className='block w-full mt-1 text-gray-900 form-select'
          value={selectedGrid}
          onChange={event => { setSelectedGrid(event.target.value) }}
        >
          {grids.map(grid => (
            <option key={grid.name} value={grid.name}>
              {grid.name}
            </option>
          ))}

          <option value=''>+ Add new Grid</option>
        </select>
      </label>

      {isNewGrid && (
        <fieldset className='flex flex-col p-3 mt-3 text-left border border-white rounded'>
          <legend>Add a new Grid</legend>

          <label>
            <span>Name</span>
            <input
              type='text'
              className='block w-full mt-1 text-gray-900 form-input'
              value={gridName}
              onChange={onGridNameChange}
              minLength='1'
              required
            />
          </label>

          <label className='mt-3'>
            <span>URL</span>
            <input
              type='url'
              className='block w-full mt-1 text-gray-900 form-input'
              placeholder='https://example.com/login'
              value={gridUrl}
              onChange={onGridUrlChange}
              required
            />
          </label>

          <label
            className='mt-3'
            title={'Most grids will support LLSD based logins.\r\n' +
            "Only un-check if grid doesn't support it!"}
          >
            <input
              type='checkbox'
              className='form-checkbox'
              checked={isGridLLSD}
              onChange={event => { setIsGridLLSD(event.target.checked) }}
            />
            <span className='ml-2'> Grid uses LLSD login</span>
          </label>
        </fieldset>
      )}

      <div className='mt-3 text-left'>
        <label>
          <input
            type='checkbox'
            className='form-checkbox'
            onChange={event => { setSaveAvatar(event.target.checked) }}
            checked={saveAvatar}
            disabled={!isSignedIn || isLoggingIn}
            aria-describedby='saveNewAvatarHelp'
          />
          <span className='ml-2'>Save / Add</span>
        </label>
        <br />
        <small id='saveNewAvatarHelp' className='leading-tight text-white'>
          Save and sync this avatar and it's chats,
          after the first successful login.
        </small>
      </div>

      <button
        id='newAvatarLoginButton'
        className='flex-auto mx-auto mt-3 btn btn--secondary'
        disabled={isLoggingIn || !isValid}
      >
        {isLoggingIn === name ? 'Connecting ...' : 'Login'}
      </button>
    </form>
  )
}

function useInput (defaultValue) {
  const [value, setValue] = useState(defaultValue)
  const [isValid, setIsValid] = useState(false)

  const onChange = useCallback(event => {
    setValue(event.target.value)
    setIsValid(event.target.validity.valid)
  }, [setValue, setIsValid])

  return [value, isValid, onChange]
}
