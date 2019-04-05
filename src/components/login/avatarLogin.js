import React, { useState, useEffect } from 'react'

import AvatarName from '../../avatarName'

import styles from './avatarLogin.module.css'

export default function AvatarLogin ({ avatar, grid, isLoggingIn, onLogin, isSelected, onSelect }) {
  const [password, setPassword] = useState('')
  useEffect(() => {
    setPassword('')
  }, [isSelected])

  if (!isSelected) {
    const onSetActive = event => {
      event.preventDefault()
      const avID = avatar.get('avatarIdentifier')
      onSelect(avID)
    }

    return <form
      className={`${styles.AvatarLoginContainer} ${styles['not-selected']}`}
      onClick={onSetActive}
      onKeyUp={event => {
        if (event.keyCode === 13) {
          onSetActive(event)
        }
      }}
      tabIndex='0'
    >
      <span className={styles.Name}>{new AvatarName(avatar.get('name')).getDisplayName()}</span>
      <span className={styles.Grid}>@{grid.get('name')}</span>

      <span className={styles.ActiveText}>click to login</span>
    </form>
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

  const avatarName = new AvatarName(avatar.get('name')).getDisplayName()
  const passwordInputId = `passwordFor${avatar.get('avatarIdentifier')}`

  return <form className={styles.AvatarLoginContainer}>
    <h2 className={styles.Name}>{avatarName}</h2>
    <span className={styles.Grid}>@{grid.get('name')}</span>

    <label className={styles.PasswordInfo} htmlFor={passwordInputId}>Password:</label>
    <input
      id={passwordInputId}
      type='password'
      className={styles.PasswordInput}
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

    <button
      className={styles.LoginButton}
      onClick={onClick}
      disabled={isLoggingIn || password.length === 0}
    >
      {isLoggingIn === avatar.get('name') ? 'Connecting ...' : 'Login'}
    </button>
  </form>
}
