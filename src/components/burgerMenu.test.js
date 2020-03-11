import { axe } from 'jest-axe'
import React from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { render } from 'reakit-test-utils'

import BurgerMenu from './burgerMenu'

import AvatarName from '../avatarName'
import configureStore from '../store/configureStore'

it('renders without crashing', () => {
  const { container } = render(
    <Provider store={configureStore()}>
      <MemoryRouter>
        <BurgerMenu isLoggedIn={false} />
      </MemoryRouter>
    </Provider>
  )

  expect(container).toBeTruthy()
})

describe('buttons', () => {
  it('not logged or signed in', () => {
    const { queryByText } = render(
      <Provider store={configureStore()}>
        <MemoryRouter>
          <BurgerMenu isLoggedIn={false} />
        </MemoryRouter>
      </Provider>
    )

    // viewer sign in
    const signInOpener = queryByText('Sign into Andromeda')
    expect(signInOpener).toBeTruthy()
    expect(signInOpener.nodeName).toBe('BUTTON')
    expect(signInOpener.id).toBe('burgerMenuSignIn')

    // viewer sign up
    const signUpOpener = queryByText('Sign up to Andromeda')
    expect(signUpOpener).toBeTruthy()
    expect(signUpOpener.nodeName).toBe('BUTTON')
    expect(signUpOpener.id).toBe('burgerMenuSignUp')

    // viewer sign out
    expect(queryByText('Log out from Viewer')).toBeNull()
    // avatar logout
    expect(queryByText('log out')).toBeNull()
  })

  it('avatar logged in', () => {
    const { queryByText } = render(
      <Provider
        store={configureStore({
          names: {
            names: {
              abc: new AvatarName('Tester')
            }
          },
          session: {
            agentId: 'abc',
            avatarIdentifier: 'abc@test.org',
            sessionId: '1234'
          }
        })}
      >
        <MemoryRouter>
          <BurgerMenu isLoggedIn />
        </MemoryRouter>
      </Provider>
    )

    // viewer sign in
    const signInOpener = queryByText('Sign into Andromeda')
    expect(signInOpener).toBeTruthy()
    expect(signInOpener.nodeName).toBe('BUTTON')
    expect(signInOpener.id).toBe('burgerMenuSignIn')

    // viewer sign up
    const signUpOpener = queryByText('Sign up to Andromeda')
    expect(signUpOpener).toBeTruthy()
    expect(signUpOpener.nodeName).toBe('BUTTON')
    expect(signUpOpener.id).toBe('burgerMenuSignUp')

    // viewer sign out
    expect(queryByText('Log out from Viewer')).toBeNull()

    // avatar logout
    const logOut = queryByText('log out')
    expect(logOut).toBeTruthy()
    expect(logOut.nodeName).toBe('BUTTON')
    expect(logOut.id).toBe('sidebarAvatarLogout')
  })

  it('viewer account logged in', () => {
    const { queryByText } = render(
      <Provider
        store={configureStore({
          account: {
            loggedIn: true,
            username: 'tester@test.org'
          }
        })}
      >
        <MemoryRouter>
          <BurgerMenu isLoggedIn={false} />
        </MemoryRouter>
      </Provider>
    )

    // viewer sign in
    expect(queryByText('Sign into Andromeda')).toBeNull()

    // viewer sign up
    expect(queryByText('Sign up to Andromeda')).toBeNull()

    // viewer sign out
    const signOut = queryByText('Log out from Viewer')
    expect(signOut).toBeTruthy()
    expect(signOut.nodeName).toBe('BUTTON')
    expect(signOut.id).toBe('sidebarSignOut')

    // avatar logout
    expect(queryByText('log out')).toBeNull()
  })

  it('viewer and avatar logged in', () => {
    const { queryByText } = render(
      <Provider
        store={configureStore({
          account: {
            loggedIn: true,
            username: 'tester@test.org'
          },
          names: {
            names: {
              abc: new AvatarName('Tester')
            }
          },
          session: {
            agentId: 'abc',
            avatarIdentifier: 'abc@test.org',
            sessionId: '1234'
          }
        })}
      >
        <MemoryRouter>
          <BurgerMenu isLoggedIn />
        </MemoryRouter>
      </Provider>
    )

    // viewer sign in
    expect(queryByText('Sign into Andromeda')).toBeNull()

    // viewer sign up
    expect(queryByText('Sign up to Andromeda')).toBeNull()

    // viewer sign out
    const signOut = queryByText('Log out from Viewer')
    expect(signOut).toBeTruthy()
    expect(signOut.nodeName).toBe('BUTTON')
    expect(signOut.id).toBe('sidebarSignOut')

    // avatar logout
    const logOut = queryByText('log out')
    expect(logOut).toBeTruthy()
    expect(logOut.nodeName).toBe('BUTTON')
    expect(logOut.id).toBe('sidebarAvatarLogout')
  })
})

it('should pass aXe', async () => {
  const { container } = render(
    <Provider store={configureStore()}>
      <MemoryRouter>
        <BurgerMenu
          isSignedIn={false}
          userName=''
          isLoggedIn={false}
          avatarName=''
          signIn={() => {}}
          signUp={() => {}}
          signOut={() => {}}
          logout={() => {}}
        />
      </MemoryRouter>
    </Provider>
  )

  expect(await axe(container)).toHaveNoViolations()
})
