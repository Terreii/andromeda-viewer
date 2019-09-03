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
      onSelect(avatar.avatarIdentifier)
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
      <span className={styles.Name}>{new AvatarName(avatar.name).getDisplayName()}</span>
      <span className={styles.Grid}>@{grid.name}</span>

      <span className={styles.ActiveText}>click to login</span>
    </form>
  }

  const onSubmit = event => {
    event.preventDefault()

    if (password.length > 0) {
      onLogin(avatar, password)
    }
  }

  const avatarName = new AvatarName(avatar.name).getDisplayName()
  const passwordInputId = `passwordFor${avatar.avatarIdentifier}`

  return <form className={styles.AvatarLoginContainer} onSubmit={onSubmit}>
    <h2 className={styles.Name}>{avatarName}</h2>
    <span className={styles.Grid}>@{grid.name}</span>

    <label className={styles.PasswordInfo} htmlFor={passwordInputId}>Password:</label>
    <input
      id={passwordInputId}
      type='password'
      className={styles.PasswordInput}
      value={password}
      onChange={event => { setPassword(event.target.value) }}
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

    <button className={styles.LoginButton} disabled={isLoggingIn || password.length === 0}>
      {isLoggingIn === avatar.name ? 'Connecting ...' : 'Login'}
    </button>
  </form>
}
