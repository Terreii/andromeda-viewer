import React from 'react'

import BurgerMenu from './burgerMenu'
import { viewerName } from '../viewerInfo'

import styles from './topBar.module.css'

export default function TopBar ({
  isSignedIn,
  userName,
  isLoggedIn,
  avatarName,
  signOut,
  logout
}) {
  return <div className={styles.Container}>
    <BurgerMenu
      isSignedIn={isSignedIn}
      userName={userName}
      isLoggedIn={isLoggedIn}
      avatarName={avatarName}
      signOut={signOut}
      logout={logout}
    />
    {isLoggedIn
      ? null
      : <span>Login to <span>{viewerName}</span></span>
    }
    <span />
  </div>
}
