import { axe } from 'jest-axe'
import React from 'react'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'

import BurgerMenu from './burgerMenu'
import configureStore from '../store/configureStore'

test('renders without crashing', () => {
  mount(<Provider store={configureStore()}>
    <MemoryRouter>
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
    </MemoryRouter>
  </Provider>)
})

test('click handling', () => {
  let signInCount = 0
  let signUpCount = 0
  let signOutCount = 0
  let logoutCount = 0

  // Nothing logged in

  const menu = mount(<Provider store={configureStore()}>
    <MemoryRouter>
      <BurgerMenu
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
      />
    </MemoryRouter>
  </Provider>)

  menu.find('#burgerMenuSignIn').simulate('click') // viewer sign in
  menu.find('#burgerMenuSignUp').simulate('click') // viewer sign up

  expect(signInCount).toBe(1)
  expect(signUpCount).toBe(1)
  expect(logoutCount).toBe(0)
  expect(signOutCount).toBe(0)

  // Avatar logged in

  const menuAvatarLoggedIn = mount(<Provider store={configureStore()}>
    <MemoryRouter>
      <BurgerMenu
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
      />
    </MemoryRouter>
  </Provider>)

  menuAvatarLoggedIn.find('#burgerMenuSignIn').simulate('click') // viewer sign in
  menuAvatarLoggedIn.find('#burgerMenuSignUp').simulate('click') // viewer sign up
  menuAvatarLoggedIn.find('#sidebarAvatarLogout').simulate('click') // avatar logout

  expect(signInCount).toBe(2)
  expect(signUpCount).toBe(2)
  expect(logoutCount).toBe(1)
  expect(signOutCount).toBe(0)

  // Viewr account logged in

  const menuViewerSignedIn = mount(<Provider store={configureStore()}>
    <MemoryRouter>
      <BurgerMenu
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
      />
    </MemoryRouter>
  </Provider>)

  menuViewerSignedIn.find('#sidebarSignOut').simulate('click') // viewer sign out

  expect(signInCount).toBe(2)
  expect(signUpCount).toBe(2)
  expect(logoutCount).toBe(1)
  expect(signOutCount).toBe(1)

  // Viewer and avatar logged in

  const menuAllIn = mount(<Provider store={configureStore()}>
    <MemoryRouter>
      <BurgerMenu
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
      />
    </MemoryRouter>
  </Provider>)

  menuAllIn.find('#sidebarAvatarLogout').simulate('click') // avatar logout
  menuAllIn.find('#sidebarSignOut').simulate('click') // viewer sign out

  expect(signInCount).toBe(2)
  expect(signUpCount).toBe(2)
  expect(logoutCount).toBe(2)
  expect(signOutCount).toBe(2)
})

test('should pass aXe', async () => {
  const rendered = mount(<Provider store={configureStore()}>
    <MemoryRouter>
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
    </MemoryRouter>
  </Provider>)

  expect(await axe(rendered.html())).toHaveNoViolations()
})
