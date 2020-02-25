import React from 'react'
import { useSelector } from 'react-redux'

import BurgerMenu from './burgerMenu'
import { viewerName } from '../viewerInfo'

import { selectIsLoggedIn } from '../bundles/session'

import styles from './topBar.module.css'

export default function TopBar () {
  const isLoggedIn = useSelector(selectIsLoggedIn)

  return <div className={styles.Container}>
    <BurgerMenu isLoggedIn={isLoggedIn} />
    {isLoggedIn
      ? null
      : <span>Login to <span>{viewerName}</span></span>
    }
    <span />
  </div>
}
