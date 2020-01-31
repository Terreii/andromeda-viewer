import { axe } from 'jest-axe'
import React from 'react'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'

import BurgerMenu from './burgerMenu'
import configureStore from '../store/configureStore'

it('renders without crashing', () => {
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

it('click handling', () => {
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
        signOut={() => {
          signOutCount += 1
        }}
        logout={() => {
          logoutCount += 1
        }}
      />
    </MemoryRouter>
  </Provider>)

  expect(menu.find('button#burgerMenuSignIn').length).toBe(1) // viewer sign in
  expect(menu.find('button#burgerMenuSignUp').length).toBe(1) // viewer sign up
  expect(menu.find('button#sidebarSignOut').length).toBe(0) // viewer sign out
  expect(menu.find('button#sidebarAvatarLogout').length).toBe(0) // avatar logout

  // Avatar logged in

  const menuAvatarLoggedIn = mount(<Provider store={configureStore()}>
    <MemoryRouter>
      <BurgerMenu
        isSignedIn={false}
        userName={''}
        isLoggedIn
        avatarName={'Tester'}
        signOut={() => {
          signOutCount += 1
        }}
        logout={() => {
          logoutCount += 1
        }}
      />
    </MemoryRouter>
  </Provider>)

  expect(menuAvatarLoggedIn.find('button#burgerMenuSignIn').length).toBe(1) // viewer sign in
  expect(menuAvatarLoggedIn.find('button#burgerMenuSignUp').length).toBe(1) // viewer sign up
  expect(menuAvatarLoggedIn.find('button#sidebarSignOut').length).toBe(0) // viewer sign out
  expect(menuAvatarLoggedIn.find('button#sidebarAvatarLogout').length).toBe(1) // avatar logout

  menuAvatarLoggedIn.find('button#sidebarAvatarLogout').simulate('click') // avatar logout

  expect(logoutCount).toBe(1)
  expect(signOutCount).toBe(0)

  // Viewer account logged in

  const menuViewerSignedIn = mount(<Provider store={configureStore()}>
    <MemoryRouter>
      <BurgerMenu
        isSignedIn
        userName={'tester@test.org'}
        isLoggedIn={false}
        avatarName={''}
        signOut={() => {
          signOutCount += 1
        }}
        logout={() => {
          logoutCount += 1
        }}
      />
    </MemoryRouter>
  </Provider>)

  // TODO: test for sign in and up buttons not being rendered

  expect(menuViewerSignedIn.find('button#sidebarSignOut')).toExist() // viewer sign out

  expect(logoutCount).toBe(1)

  // Viewer and avatar logged in

  const menuAllIn = mount(<Provider store={configureStore()}>
    <MemoryRouter>
      <BurgerMenu
        isSignedIn
        userName={'tester@test.org'}
        isLoggedIn
        avatarName={'Tester'}
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
  expect(menuAllIn.find('button#sidebarSignOut')).toExist() // viewer sign out

  expect(logoutCount).toBe(2)
})

it('should pass aXe', async () => {
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
