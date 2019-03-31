import React from 'react'
import styled from 'styled-components'

import BurgerMenu from './burgerMenu'
import { viewerName } from '../viewerInfo'

const MenuBar = styled.div`
  z-index: 100;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: fixed;
  top: 0em;
  left: 0em;
  width: 100vw;
  height: 2rem;
  background-color: rgb(77, 80, 85);
  color: rgb(211, 211, 211);
  padding-top: .5em;
  padding-bottom: .5em;

  & > * {
    margin-top: .4em;
    margin-bottom: .4em;
  }
`

const ViewerName = styled.span`
  text-transform: capitalize;
`

export default function TopBar ({
  isSignedIn,
  userName,
  isLoggedIn,
  avatarName,
  signIn,
  signUp,
  signOut,
  logout
}) {
  return <MenuBar>
    <BurgerMenu
      isSignedIn={isSignedIn}
      userName={userName}
      isLoggedIn={isLoggedIn}
      avatarName={avatarName}
      signIn={signIn}
      signUp={signUp}
      signOut={signOut}
      logout={logout}
    />
    {isLoggedIn
      ? null
      : <span>Login to <ViewerName>{viewerName}</ViewerName></span>
    }
    <span />
  </MenuBar>
}
