import { axe } from 'jest-axe'
import React from 'react'
import { shallow, mount } from 'enzyme'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'

import TopBar from './topBar'
import configureStore from '../store/configureStore'

test('renders without crashing', () => {
  shallow(<MemoryRouter>
    <TopBar
      isSignedIn={false}
      userName={''}
      isLoggedIn={false}
      avatarName={''}
      signIn={() => {}}
      signUp={() => {}}
      signOut={() => {}}
      logout={() => {}}
    />
  </MemoryRouter>)
})

test('should pass aXe', async () => {
  const store = configureStore()

  const rendered = mount(<Provider store={store}>
    <MemoryRouter>
      <TopBar
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
