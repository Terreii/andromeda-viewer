import { axe } from 'jest-axe'
import { shallow, mount } from 'enzyme'
import React from 'react'
import { Provider } from 'react-redux'

import SignIn from './signIn'

test('renders without crashing', () => {
  shallow(<SignIn />)
})

test('on buttons click', () => {
  const store = {
    getState: () => ({}),
    dispatch: () => {},
    subscribe: () => () => {}
  }

  const rendered = mount(<Provider store={store}>
    <SignIn />
  </Provider>)

  const buttons = rendered.find('button[aria-haspopup="dialog"]')
  expect(buttons.length).toBe(2)
})

test('should pass aXe', async () => {
  const store = {
    getState: () => ({}),
    dispatch: () => {},
    subscribe: () => () => {}
  }

  const rendered = mount(<Provider store={store}>
    <SignIn showSignInPopup={() => {}} />
  </Provider>)

  expect(await axe(rendered.html())).toHaveNoViolations()
})
