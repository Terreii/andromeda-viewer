import { axe } from 'jest-axe'
import React from 'react'
import { shallow, mount } from 'enzyme'
import Immutable from 'immutable'
import { Provider } from 'react-redux'

import BurgerMenu from './burgerMenu'
import configureStore from '../store/configureStore'

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

  // Nothing logged in

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

  expect(menu.children().length).toBe(3)

  menu.childAt(1).simulate('click') // viewer sign in
  menu.childAt(2).simulate('click') // viewer sign up

  expect(signInCount).toBe(1)
  expect(signUpCount).toBe(1)
  expect(logoutCount).toBe(0)
  expect(signOutCount).toBe(0)

  // Avatar logged in

  const menuAvatarLoggedIn = shallow(<BurgerMenu
    account={account.merge({
      avatarName: 'Tester',
      loggedIn: true
    })}
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

  expect(menuAvatarLoggedIn.children().length).toBe(5)

  menuAvatarLoggedIn.childAt(2).simulate('click') // viewer sign in
  menuAvatarLoggedIn.childAt(3).simulate('click') // viewer sign up
  menuAvatarLoggedIn.childAt(4).simulate('click') // avatar logout

  expect(signInCount).toBe(2)
  expect(signUpCount).toBe(2)
  expect(logoutCount).toBe(1)
  expect(signOutCount).toBe(0)

  // Viewr account logged in

  const menuViewerSignedIn = shallow(<BurgerMenu
    account={account.mergeDeep({
      viewerAccount: {
        loggedIn: true,
        username: 'tester@test.org'
      }
    })}
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

  expect(menuViewerSignedIn.children().length).toBe(3)

  menuViewerSignedIn.childAt(2).simulate('click') // viewer sign out

  expect(signInCount).toBe(2)
  expect(signUpCount).toBe(2)
  expect(logoutCount).toBe(1)
  expect(signOutCount).toBe(1)

  // Viewer and avatar logged in

  const menuAllIn = shallow(<BurgerMenu
    account={account.mergeDeep({
      avatarName: 'Tester',
      loggedIn: true,
      viewerAccount: {
        loggedIn: true,
        username: 'tester@test.org'
      }
    })}
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

  expect(menuAllIn.children().length).toBe(5)

  menuAllIn.childAt(3).simulate('click') // avatar logout
  menuAllIn.childAt(4).simulate('click') // viewer sign out

  expect(signInCount).toBe(2)
  expect(signUpCount).toBe(2)
  expect(logoutCount).toBe(2)
  expect(signOutCount).toBe(2)
})

test('should pass aXe', async () => {
  const account = Immutable.fromJS({
    avatarName: '',
    loggedIn: false,
    viewerAccount: {
      loggedIn: false,
      username: '',
      signInPopup: ''
    }
  })

  const rendered = mount(<Provider store={configureStore()}>
    <BurgerMenu
      account={account}
      signIn={() => {}}
      signUp={() => {}}
      signOut={() => {}}
      logout={() => {}}
    />
  </Provider>)

  expect(await axe(rendered.html())).toHaveNoViolations()
})
