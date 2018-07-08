import React from 'react'
import Menu from 'react-burger-menu/lib/menus/slide'
import {decorator as reduxBurgerMenu} from 'redux-burger-menu'
import styled, {injectGlobal} from 'styled-components'

const Link = styled.a`
  color: white;
`

const LogoutButton = Link.extend`
  :after {
    content: " >>";
  }
`

const MenuText = Link.withComponent('span')

injectGlobal`
  .bm-burger-button {
    position: fixed;
    width: 36px;
    height: 30px;
    left: 9px;
    top: 9px;
  }

  .bm-overlay {
    top: 0px;
  }

  .bm-burger-bars {
    background: rgb(211, 211, 211);
  }

  .bm-morph-shape {
    fill: #373a47;
  }

  .bm-menu-wrap {
    top: 0em;
  }

  .bm-menu {
    background: #373a47;

    a, span {
      color: #b8b7ad;

      &:hover,
      &:focus {
        color: #c94e50;
      }
    }
  }

  .bm-item-list a, .bm-item-list span {
    padding: 0.8em 0em 0.8em 0em;
    font-weight: 700;

    span {
      margin-left: 10px;
    }
  }

  .bm-item-list a {
    display: block;
  }

  .bm-cross {
    background: #bdc3c7;
  }

  .bm-menu {
    padding: 2.5em 1.5em 0;
    font-size: 1.15em;
  }
`

const SlideMenu = reduxBurgerMenu(Menu)

export default function BurgerMenu ({account, signIn, signUp, logout, signOut}) {
  const avatarLoggedIn = account.get('loggedIn')
  const avatarName = account.get('avatarName')
  const viewerLoggedIn = account.getIn(['viewerAccount', 'loggedIn'])
  const username = account.getIn(['viewerAccount', 'username'])
  const greeting = avatarLoggedIn
    ? `Hello ${avatarName}`
    : ''

  const viewerAccountText = viewerLoggedIn
    ? <MenuText>
      {`Hello ${username}`}
    </MenuText>
    : <Link href='#signin' onClick={signIn}>
      Sign into Andromeda
    </Link>

  return <SlideMenu>
    <MenuText>{greeting}</MenuText>

    {viewerAccountText}

    <Link
      className='menu-item'
      style={{display: viewerLoggedIn ? 'none' : ''}}
      href='#signup'
      onClick={signUp}
    >
      Sign up to Andromeda
    </Link>

    <LogoutButton
      className='menu-item'
      style={{display: avatarLoggedIn ? '' : 'none'}}
      href='#'
      onClick={logout}
    >
      log out
    </LogoutButton>

    <Link
      className='menu-item'
      style={{display: viewerLoggedIn ? '' : 'none'}}
      href=''
      onClick={signOut}
    >
      Log out from Viewer
    </Link>
  </SlideMenu>
}
