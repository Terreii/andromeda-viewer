import React from 'react'
import Menu from 'react-burger-menu/lib/menus/slide'
import { decorator as reduxBurgerMenu } from 'redux-burger-menu'
import styled, { createGlobalStyle } from 'styled-components'

const MenuButton = styled.button`
  color: white;
  background: rgba(0, 0, 0, 0);
  border: 0px;
  font-size: 1.15em;
`

const LogoutButton = styled(MenuButton)`
  :after {
    content: " >>";
  }
`

const MenuText = MenuButton.withComponent('span')

const GlobalStyles = createGlobalStyle`
  .bm-burger-button {
    position: fixed;
    width: 36px;
    height: 30px;
    left: 9px;
    top: 9px;

    button:focus {
      outline: 2px solid highlight;
    }
  }

  .bm-overlay {
    top: 0px;
  }

  .bm-burger-bars {
    background: rgb(211, 211, 211);
    border-radius: 1em;
  }

  .bm-morph-shape {
    fill: #373a47;
  }

  .bm-menu-wrap {
    top: 0em;
  }

  .bm-menu {
    background: #373a47;

    button, span {
      font-family: serif;
      color: #b8b7ad;

      &:hover,
      &:focus {
        color: #c94e50;
      }
    }
  }

  .bm-item-list button, .bm-item-list span {
    padding: 0.8em 0em 0.8em 0em;
    font-weight: 700;

    span {
      margin-left: 10px;
    }
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
    <GlobalStyles />

    {isLoggedIn ? <MenuText>{`Hello ${avatarName}`}</MenuText> : null}

    {isSignedIn
      ? <MenuText>{`Hello ${userName}`}</MenuText>
      : <MenuButton onClick={signIn}>Sign into Andromeda</MenuButton>
    }

    {isSignedIn
      ? null
      : <MenuButton className='menu-item' onClick={signUp}>
        Sign up to Andromeda
      </MenuButton>
    }

    {isLoggedIn
      ? <LogoutButton className='menu-item' onClick={logout}>
        log out
      </LogoutButton>
      : null
    }

    {isSignedIn
      ? <LogoutButton className='menu-item' onClick={signOut}>
        Log out from Viewer
      </LogoutButton>
      : null
    }
  </SlideMenu>
}
