import React from 'react'
import {shallow} from 'enzyme'
import Immutable from 'immutable'

import BurgerMenu from './burgerMenu'

test('renders without crashing', () => {
  const account = Immutable.fromJS({
    avatarName: '',
    loggedIn: false,
    viewerAccount: {
      loggedIn: false,
      username: '',
      signInPopup: ''
    }
  })

  shallow(<BurgerMenu
    account={account}
    signIn={() => {}}
    signUp={() => {}}
    signOut={() => {}}
    logout={() => {}}
  />)
})

test('click handling', () => {
  const account = Immutable.fromJS({
    avatarName: '',
    loggedIn: false,
    viewerAccount: {
      loggedIn: false,
      username: '',
      signInPopup: ''
    }
  })

  let signInCount = 0
  let signUpCount = 0
  let signOutCount = 0
  let logoutCount = 0

  const menu = shallow(<BurgerMenu
    account={account}
    signIn={() => {
      signInCount += 1
    }}
    signUp={() => {
      signUpCount += 1
    }}
    signOut={() => {
      signOutCount += 1
    }}
    logout={() => {
      logoutCount += 1
    }}
  />)

  menu.find('[href="#signin"]').simulate('click')
  menu.find('[href="#signup"]').simulate('click')
  menu.find('[href="#signout"]').simulate('click')
  menu.find('[href="#logout"]').simulate('click')

  expect(signInCount).toBe(1)
  expect(signUpCount).toBe(1)
  expect(signOutCount).toBe(1)
  expect(logoutCount).toBe(1)
})
