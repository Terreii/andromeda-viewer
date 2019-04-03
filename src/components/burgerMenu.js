import React from 'react'
import Menu from 'react-burger-menu/lib/menus/slide'
import { decorator as reduxBurgerMenu } from 'redux-burger-menu'

import styles from './topBar.module.css'
import './burgerMenu.css'

const SlideMenu = reduxBurgerMenu(Menu)

export default function BurgerMenu ({ account, signIn, signUp, logout, signOut }) {
  const avatarLoggedIn = account.get('loggedIn')
  const avatarName = account.get('avatarName')
  const viewerLoggedIn = account.getIn(['viewerAccount', 'loggedIn'])
  const username = account.getIn(['viewerAccount', 'username'])

  return <SlideMenu>
    {avatarLoggedIn
      ? <span className={styles.BurgerMenuItem}>{`Hello ${avatarName}`}</span>
      : null}

    {viewerLoggedIn
      ? <span className={styles.BurgerMenuItem}>{`Hello ${username}`}</span>
      : <button className={styles.BurgerMenuItem} onClick={signIn}>Sign into Andromeda</button>
    }

    {viewerLoggedIn
      ? null
      : <button className={'menu-item ' + styles.BurgerMenuItem} onClick={signUp}>
        Sign up to Andromeda
      </button>
    }

    {avatarLoggedIn
      ? <button className={'menu-item ' + styles.BurgerMenuLogout} onClick={logout}>
        log out
      </button>
      : null
    }

    {viewerLoggedIn
      ? <button className={'menu-item ' + styles.BurgerMenuLogout} onClick={signOut}>
        Log out from Viewer
      </button>
      : null
    }
  </SlideMenu>
}
