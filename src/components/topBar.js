import React from 'react'

import BurgerMenu from './burgerMenu'
import { viewerName } from '../viewerInfo'

import styles from './topBar.module.css'

export default function TopBar ({ account, signIn, signUp, signOut, logout }) {
  return <div className={styles.Container}>
    <BurgerMenu
      account={account}
      signIn={signIn}
      signUp={signUp}
      signOut={signOut}
      logout={logout}
    />
    {account.getIn(['loggedIn'])
      ? null
      : <span>Login to <span>{viewerName}</span></span>
    }
    <span />
  </div>
}
