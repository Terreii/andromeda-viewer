import { useState, useEffect } from 'react'

import AvatarName from '../../avatarName'

import { useAutoFocus } from '../../hooks/utils'

export default function AvatarLogin ({ avatar, grid, isLoggingIn, onLogin, isSelected, onSelect }) {
  const [password, setPassword] = useState('')
  useEffect(() => {
    setPassword('')
  }, [isSelected])

  const doAutoFocus = useAutoFocus()

  if (!isSelected) {
    return (
      <form
        className='flex flex-col row-auto p-4 m-4 text-white bg-gray-700 rounded focus-within:ring'
        onSubmit={event => {
          event.preventDefault()
          onSelect(avatar.avatarIdentifier)
        }}
      >
        <button className='flex flex-col text-white btn--transparent focus:outline-none'>
          <h2 className='block m-1 text-center'>
            <span className='text-2xl'>{new AvatarName(avatar.name).getDisplayName()}</span>
            <span className='inline-block ml-3'>@{grid.name}</span>
          </h2>

          <span className='text-center text-gray-400'>click to login</span>
        </button>
      </form>
    )
  }

  const onSubmit = event => {
    event.preventDefault()

    if (password.length > 0) {
      onLogin(avatar, password)
    }
  }

  const avatarName = new AvatarName(avatar.name).getDisplayName()
  const passwordInputId = `passwordFor${avatar.avatarIdentifier}`

  return (
    <form
      className='flex flex-col p-4 m-4 text-white bg-gray-700 rounded shadow'
      onSubmit={onSubmit}
    >
      <h2 className='block m-1 text-center'>
        <span className='text-2xl'>{new AvatarName(avatar.name).getDisplayName()}</span>
        <span className='inline-block ml-3'>@{grid.name}</span>
      </h2>

      <label className='text-left' htmlFor={passwordInputId}>
        <span>Password</span>
        <input
          id={passwordInputId}
          type='password'
          className='block w-full mt-1 text-gray-900 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
          value={password}
          onChange={event => { setPassword(event.target.value) }}
          required
          autoFocus
          ref={doAutoFocus}
          disabled={isLoggingIn}
          aria-label={'password for ' + avatarName}
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

      <button
        className='flex-auto mx-auto mt-3 btn btn--secondary'
        disabled={isLoggingIn || password.length === 0}
      >
        {isLoggingIn === avatar.name ? 'Connecting ...' : 'Login'}
      </button>
    </form>
  )
}
