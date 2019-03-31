import { axe } from 'jest-axe'
import React from 'react'
import { shallow, mount } from 'enzyme'
import { Provider } from 'react-redux'

import TopBar from './topBar'
import configureStore from '../store/configureStore'

test('renders without crashing', () => {
  shallow(<TopBar
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

test('should pass aXe', async () => {
  const store = configureStore()

  const rendered = mount(<Provider store={store}>
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
  </Provider>)

  expect(await axe(rendered.html())).toHaveNoViolations()
})
