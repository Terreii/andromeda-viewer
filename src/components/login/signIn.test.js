import { axe } from 'jest-axe'
import React from 'react'
import { shallow, mount } from 'enzyme'

import SignIn from './signIn'

test('renders without crashing', () => {
  shallow(<SignIn />)
})

test('on buttons click', () => {
  const callbackData = []

  const rendered = mount(<SignIn
    showSignInPopup={prop => {
      callbackData.push(prop)
    }}
  />)

  const buttons = rendered.find('button')
  expect(buttons.length).toBe(2)

  buttons.forEach(button => {
    button.simulate('click')
  })

  expect(callbackData).toEqual([
    undefined, // singIn
    'signUp'
  ])
})

test('should pass aXe', async () => {
  const rendered = mount(<SignIn showSignInPopup={() => {}} />)

  expect(await axe(rendered.html())).toHaveNoViolations()
})
