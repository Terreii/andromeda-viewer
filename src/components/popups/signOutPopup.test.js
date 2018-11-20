import React from 'react'
import { shallow, mount } from 'enzyme'

import SignOutPopup from './signOutPopup'

test('renders without crashing', () => {
  shallow(
    <SignOutPopup onCancel={() => {}} onSignOut={() => {}} />
  )
})

test('renders title and buttons', () => {
  const popup = mount(<SignOutPopup onCancel={() => {}} onSignOut={() => {}} />)

  expect(popup.find('h4').text()).toBe('Sign Out?')

  const buttons = popup.find('button')

  expect(buttons.length).toBe(3)
  expect(buttons.at(1).text()).toBe('cancel')
  expect(buttons.last().text()).toBe('sign out')
})

test('event handling', () => {
  let cancelCount = 0
  let sendCount = 0

  const popup = mount(<SignOutPopup
    onCancel={() => {
      cancelCount += 1
    }}
    onSignOut={() => {
      sendCount += 1
    }}
  />)

  popup.find('button').forEach(button => {
    if (button.hasClass('closePopup')) {
      return
    }
    button.simulate('click')
  })

  popup.find('button.closePopup').simulate('click', {
    preventDefault: () => {}
  })

  expect(cancelCount).toBe(2)
  expect(sendCount).toBe(1)
})
