import React from 'react'
import Menu from 'react-burger-menu/lib/menus/slide'
import { decorator as reduxBurgerMenu } from 'redux-burger-menu'

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
  return <SlideMenu>
    {isLoggedIn
      ? <span className={styles.BurgerMenuItem}>{`Hello ${avatarName}`}</span>
      : null}

    {isSignedIn
      ? <span className={styles.BurgerMenuItem}>{`Hello ${userName}`}</span>
      : <button className={styles.BurgerMenuItem} onClick={signIn}>Sign into Andromeda</button>
    }

    {isSignedIn
      ? null
      : <button className={'menu-item ' + styles.BurgerMenuItem} onClick={signUp}>
        Sign up to Andromeda
      </button>
    }

    {isLoggedIn
      ? <button className={'menu-item ' + styles.BurgerMenuLogout} onClick={logout}>
        log out
      </button>
      : null
    }

    {isSignedIn
      ? <button className={'menu-item ' + styles.BurgerMenuLogout} onClick={signOut}>
        Log out from Viewer
      </button>
      : null
    }
  </SlideMenu>
}
