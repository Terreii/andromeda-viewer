import React, { useState, useEffect } from 'react'

import AvatarName from '../../avatarName'

import { useAutoFocus } from '../../hooks/utils'

import styles from './avatarLogin.module.css'

export default function AvatarLogin ({ avatar, grid, isLoggingIn, onLogin, isSelected, onSelect }) {
  const [password, setPassword] = useState('')
  useEffect(() => {
    setPassword('')
  }, [isSelected])

  const doAutoFocus = useAutoFocus()

  if (!isSelected) {
    return <form
      className={`${styles.AvatarLoginContainer} ${styles['not-selected']}`}
      onSubmit={event => {
        event.preventDefault()
        onSelect(avatar.avatarIdentifier)
      }}
    >
      <button className={styles.HiddenButton}>
        <span className={styles.Name}>{new AvatarName(avatar.name).getDisplayName()}</span>
        <span className={styles.Grid}>@{grid.name}</span>

        <span className={styles.ActiveText}>click to login</span>
      </button>
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

    <button className={styles.LoginButton} disabled={isLoggingIn || password.length === 0}>
      {isLoggingIn === avatar.name ? 'Connecting ...' : 'Login'}
    </button>
  </form>
}
