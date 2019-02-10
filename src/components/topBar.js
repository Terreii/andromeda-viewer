import React from 'react'
import styled from 'styled-components'

import BurgerMenu from './burgerMenu'

const MenuBar = styled.div`
  z-index: 100;
  top: 0em;
  left: 0em;
  width: 100vw;
  min-height: 2rem;
  max-height: 5rem;
  background-color: rgb(77, 80, 85);
  color: rgb(211, 211, 211);
  padding-top: .5em;
  padding-bottom: .5em;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  & > * {
    margin-top: .4em;
    margin-bottom: .4em;
  }
`

export default function TopBar ({ account, signIn, signUp, signOut, logout }) {
  return <MenuBar>
    <BurgerMenu
      account={account}
      signIn={signIn}
      signUp={signUp}
      signOut={signOut}
      logout={logout}
    />
  </MenuBar>
}
