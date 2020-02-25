import React from 'react'
import Menu from 'react-burger-menu/lib/menus/slide'
import {
  decorator as reduxBurgerMenu,
  action as toggleMenu
} from 'redux-burger-menu'
import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useDialogState, DialogDisclosure } from 'reakit'

import { selectIsSignedIn, selectUserName } from '../bundles/account'
import { selectOwnAvatarName } from '../bundles/names'

import { logout } from '../actions/sessionActions'
import { signOut } from '../actions/viewerAccount'

import SignInDialog from './modals/signIn'
import SignOutDialog from './modals/signOut'

import styles from './topBar.module.css'
import './burgerMenu.css'

const SlideMenu = reduxBurgerMenu(Menu)

export default function BurgerMenu ({ isLoggedIn }) {
  const dispatch = useDispatch()
  const isSignedIn = useSelector(selectIsSignedIn)
  const userName = useSelector(selectUserName)
  const avatarName = useSelector(selectOwnAvatarName)

  const doLogout = event => {
    event.preventDefault()
    dispatch(toggleMenu(false))
    dispatch(logout())
  }

  const doSignOutFromViewer = event => {
    event.preventDefault()
    dispatch(toggleMenu(false))
    dispatch(signOut())
  }

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
      : <SignInDialogOpener
        id='burgerMenuSignIn'
        className={styles.BurgerMenuItem}
      >
        Sign into Andromeda
      </SignInDialogOpener>
    }

    {!isSignedIn && <SignInDialogOpener
      id='burgerMenuSignUp'
      className={'menu-item ' + styles.BurgerMenuItem}
      isSignUp
    >
      Sign up to Andromeda
    </SignInDialogOpener>}

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
      onClick={doLogout}
    >
      log out
    </button>}

    {isSignedIn && <SignOutDialogOpener signOut={doSignOutFromViewer} />}
  </SlideMenu>
}

function SignInDialogOpener ({ id, className, isSignUp, children }) {
  const dialog = useDialogState()

  return <>
    <DialogDisclosure {...dialog} id={id} className={className}>
      {children}
    </DialogDisclosure>
    <SignInDialog dialog={dialog} isSignUp={isSignUp} />
  </>
}

function SignOutDialogOpener ({ signOut }) {
  const dialog = useDialogState()

  return <>
    <DialogDisclosure
      {...dialog}
      id='sidebarSignOut'
      className={'menu-item ' + styles.BurgerMenuLogout}
    >
      Log out from Viewer
    </DialogDisclosure>
    <SignOutDialog dialog={dialog} onSignOut={signOut} />
  </>
}
