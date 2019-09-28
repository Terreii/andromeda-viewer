import React from 'react'
import Menu from 'react-burger-menu/lib/menus/slide'
import {
  decorator as reduxBurgerMenu,
  action as toggleMenu
} from 'redux-burger-menu'
import { NavLink } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import styles from './topBar.module.css'
import './burgerMenu.css'

const SlideMenu = reduxBurgerMenu(Menu)

export default function BurgerMenu ({
  isSignedIn,
  userName,
  isLoggedIn,
  avatarName,
  signIn,
  signUp,
  logout,
  signOut
}) {
  const dispatch = useDispatch()
  const doClose = () => {
    dispatch(toggleMenu(false))
  }

  return <SlideMenu>
    {isSignedIn
      ? <NavLink className={styles.BurgerMenuItem} to='/profile' onClick={doClose}>
        Signed in as
        <br />
        <small>{userName}</small>
      </NavLink>
      : <button
        id='burgerMenuSignIn'
        className={styles.BurgerMenuItem}
        onClick={signIn}
      >
        Sign into Andromeda
      </button>
    }

    {!isSignedIn && <button
      id='burgerMenuSignUp'
      className={'menu-item ' + styles.BurgerMenuItem}
      onClick={signUp}
    >
      Sign up to Andromeda
    </button>}

    <hr />

    {!isLoggedIn && <NavLink className={styles.BurgerMenuItem} exact to='/' onClick={doClose}>
      Avatar List
    </NavLink>}

    {isLoggedIn && <span className={styles.BurgerMenuItem}>
      Current Avatar:
      <br />
      {avatarName.toString()}
    </span>}

    {isLoggedIn && <NavLink className={styles.BurgerMenuItem} to='/session' onClick={doClose}>
      Chat
    </NavLink>}

    <hr />

    {isLoggedIn && <button
      id='sidebarAvatarLogout'
      className={'menu-item ' + styles.BurgerMenuLogout}
      onClick={logout}
    >
      log out
    </button>}

    {isSignedIn && <button
      id='sidebarSignOut'
      className={'menu-item ' + styles.BurgerMenuLogout}
      onClick={signOut}
    >
      Log out from Viewer
    </button>}
  </SlideMenu>
}
