import { axe } from 'jest-axe'
import React from 'react'
import { shallow, mount } from 'enzyme'
import { Provider } from 'react-redux'

import BurgerMenu from './burgerMenu'
import configureStore from '../store/configureStore'

test('renders without crashing', () => {
  shallow(<BurgerMenu
    isSignedIn={false}
    userName={''}
    isLoggedIn={false}
    avatarName={''}
    signIn={() => {}}
    signUp={() => {}}
    signOut={() => {}}
    logout={() => {}}
  />)
})

test('click handling', () => {
  let signInCount = 0
  let signUpCount = 0
  let signOutCount = 0
  let logoutCount = 0

  // Nothing logged in

  const menu = shallow(<BurgerMenu
    isSignedIn={false}
    userName={''}
    isLoggedIn={false}
    avatarName={''}
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

  expect(menu.children().length).toBe(2)

  menu.childAt(0).simulate('click') // viewer sign in
  menu.childAt(1).simulate('click') // viewer sign up

  expect(signInCount).toBe(1)
  expect(signUpCount).toBe(1)
  expect(logoutCount).toBe(0)
  expect(signOutCount).toBe(0)

  // Avatar logged in

  const menuAvatarLoggedIn = shallow(<BurgerMenu
    isSignedIn={false}
    userName={''}
    isLoggedIn
    avatarName={'Tester'}
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

  expect(menuAvatarLoggedIn.children().length).toBe(4)

  menuAvatarLoggedIn.childAt(1).simulate('click') // viewer sign in
  menuAvatarLoggedIn.childAt(2).simulate('click') // viewer sign up
  menuAvatarLoggedIn.childAt(3).simulate('click') // avatar logout

  expect(signInCount).toBe(2)
  expect(signUpCount).toBe(2)
  expect(logoutCount).toBe(1)
  expect(signOutCount).toBe(0)

  // Viewr account logged in

  const menuViewerSignedIn = shallow(<BurgerMenu
    isSignedIn
    userName={'tester@test.org'}
    isLoggedIn={false}
    avatarName={''}
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

  expect(menuViewerSignedIn.children().length).toBe(2)

  menuViewerSignedIn.childAt(1).simulate('click') // viewer sign out

  expect(signInCount).toBe(2)
  expect(signUpCount).toBe(2)
  expect(logoutCount).toBe(1)
  expect(signOutCount).toBe(1)

  // Viewer and avatar logged in

  const menuAllIn = shallow(<BurgerMenu
    isSignedIn
    userName={'tester@test.org'}
    isLoggedIn
    avatarName={'Tester'}
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

  expect(menuAllIn.children().length).toBe(4)

  menuAllIn.childAt(2).simulate('click') // avatar logout
  menuAllIn.childAt(3).simulate('click') // viewer sign out

  expect(signInCount).toBe(2)
  expect(signUpCount).toBe(2)
  expect(logoutCount).toBe(2)
  expect(signOutCount).toBe(2)
})

test('should pass aXe', async () => {
  const rendered = mount(<Provider store={configureStore()}>
    <BurgerMenu
      isSignedIn={false}
      userName={''}
      isLoggedIn={false}
      avatarName={''}
      signIn={() => {}}
      signUp={() => {}}
      signOut={() => {}}
      logout={() => {}}
    />
  </Provider>)

  expect(await axe(rendered.html())).toHaveNoViolations()
})
