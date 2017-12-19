import React from 'react'
import styled from 'styled-components'

import BurgerMenu from './burgerMenu'

const MenuBar = styled.div`
  z-index: 100;
  top: 0em;
  left: 0em;
  width: 100vw;
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

const Link = styled.a`
  color: white;
`

export default function TopBar ({messageOfTheDay, account, signIn, signUp, signOut, logout}) {
  const msgOfDay = messageOfTheDay
    ? <span>
      Message of the day:
      {this.props.messageOfTheDay.get('text')}
      <Link
        href={this.props.messageOfTheDay.get('href')}
        target='_blank'
        rel='noopener noreferrer'
        >
        {this.props.messageOfTheDay.get('href')}
      </Link>
    </span>
    : <span>Welcome</span>
  return <MenuBar>
    <BurgerMenu
      account={account}
      signIn={signIn}
      signUp={signUp}
      signOut={signOut}
      logout={logout}
      />
    {msgOfDay}
    <span />
  </MenuBar>
}
