import React, { useState, useEffect, useRef, useCallback } from 'react'

import formElementsStyles from '../formElements.module.css'
import styles from './avatarLogin.module.css'

export default function NewAvatarLogin ({
  isSelected,
  isSignedIn,
  isLoggingIn,
  grids,
  onSelect,
  onLogin
}) {
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

  if (!isSelected) {
    return <form
      className={`${styles.NewAvatarLoginContainer} ${styles['not-selected']}`}
      onSubmit={event => {
        event.preventDefault()
        onSelect('new')
      }}
    >
      <button className={styles.HiddenButton}>
        <h2 className={styles.Title}>Add avatar or login anonymously</h2>

        <span className={styles.ActiveText}>click to add</span>
      </button>
    </form>
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
        url: gridUrl,
        isLoginLLSD: isGridLLSD
      }
    const save = saveAvatar && isSignedIn

    onLogin(name, password, grid, save)
  }

  return <form
    className={styles.NewAvatarLoginContainer + (isNewGrid ? ' ' + styles.high : '')}
    onSubmit={doLogin}
  >
    <h2 className={styles.Title}>
      {isSignedIn ? 'Add avatar or ' : ''}
      login anonymously
    </h2>

    <label className={styles.NewName} htmlFor='newAvatarNameInput'>Avatar:</label>
    <input
      id='newAvatarNameInput'
      type='text'
      className={styles.NewNameInput}
      value={name}
      onChange={onNameChange}
      disabled={isLoggingIn}
      minLength='1'
      required
      autoFocus
      onFocus={event => {
        const target = event.target

        setTimeout(() => {
          if (target == null) return

          target.parentElement.scrollIntoView(true)
        }, 16)
      }}
    />

    <label className={styles.NewPassword} htmlFor='newAvatarPasswordInput'>Password:</label>
    <input
      id='newAvatarPasswordInput'
      type='password'
      className={styles.PasswordInput}
      value={password}
      onChange={onPasswordChange}
      disabled={isLoggingIn}
      minLength='2'
      required
    />

    <label className={styles.Grid} htmlFor='newAvatarGridSelection'>Grid:</label>
    <select
      id='newAvatarGridSelection'
      className={styles.GridSelection}
      value={selectedGrid}
      onChange={event => { setSelectedGrid(event.target.value) }}
    >
      {grids.map(grid => <option key={grid.name} value={grid.name}>
        {grid.name}
      </option>)}

      <option value=''>+ Add new Grid</option>
    </select>

    {isNewGrid && <fieldset className={styles.NewGridLine}>
      <legend>Add a new Grid</legend>

      <div className={formElementsStyles.FormField}>
        <label htmlFor='newGridNameInput'>Name</label>
        <input
          id='newGridNameInput'
          type='text'
          className={formElementsStyles.Input}
          value={gridName}
          onChange={onGridNameChange}
          minLength='1'
          required
        />
      </div>
      <div className={formElementsStyles.FormField}>
        <label htmlFor='newGridUrlInput'>URL</label>
        <input
          id='newGridUrlInput'
          type='url'
          className={formElementsStyles.Input}
          placeholder='https://example.com/login'
          value={gridUrl}
          onChange={onGridUrlChange}
          required
        />
      </div>
      <label
        id='newGridIsLLSDLabel'
        title={'Most grids will support LLSD based logins.\r\n' +
          "Only un-check if grid doesn't support it!"}
      >
        <input
          id='newGridIsLLSD'
          type='checkbox'
          checked={isGridLLSD}
          onChange={event => { setIsGridLLSD(event.target.checked) }}
        />
        {' Grid uses LLSD login'}
      </label>
    </fieldset>}

    <div className={styles.SaveNew}>
      <input
        id='saveNewAvatarButton'
        type='checkbox'
        onChange={event => { setSaveAvatar(event.target.checked) }}
        checked={saveAvatar}
        disabled={!isSignedIn || isLoggingIn}
        aria-describedby='saveNewAvatarHelp'
      />
      <label htmlFor='saveNewAvatarButton'> Save / Add</label>
      <br />
      <small id='saveNewAvatarHelp' className={styles.SaveHelp}>
        Save and sync this avatar and it's chats,
        <br />
        after the first successful login.
      </small>
    </div>
    <button
      id='newAvatarLoginButton'
      className={styles.LoginButton}
      disabled={isLoggingIn || !isValid}
    >
      {isLoggingIn === name ? 'Connecting ...' : 'Login'}
    </button>
  </form>
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
