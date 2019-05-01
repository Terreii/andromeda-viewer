import { axe } from 'jest-axe'
import React from 'react'
import { mount } from 'enzyme'
import Immutable from 'immutable'

import Notifications from './index'

global.Array.prototype.flatMap = jest.fn(function (fn) {
  return [].concat(this.map(fn))
})

test('renders without crashing', () => {
  const allNotifications = Immutable.List([
    {
      id: 0,
      notificationType: 0,
      text: 'Test',
      callbackId: null
    }
  ])

  mount(<Notifications
    notifications={allNotifications}
  />)
})

test('renders a basic MessageBox', () => {
  const allNotifications = Immutable.List([
    {
      id: 4,
      notificationType: 0,
      text: 'Test'
    }
  ])

  const onClose = jest.fn()

  const rendered = mount(<Notifications
    notifications={allNotifications}
    onClose={onClose}
  />)

  expect(rendered.find('p').text()).toBe('Test')

  const buttons = rendered.find('button')
  expect(buttons.length).toBe(1)
  buttons.at(0).simulate('click')

  expect(onClose.mock.calls.length).toBe(1)
  expect(onClose.mock.calls[0][0]).toBe(4)
})

test('renders a friendship request', () => {
  const fromId = '5df644f5-8b12-4caf-8e91-d7cae057e5f2'
  const sessionId = '84bcf978-fbb1-4fe8-b3fa-9d00e01a11d9'
  const allNotifications = Immutable.List([
    {
      id: 4,
      notificationType: 1,
      text: 'I would like to by your friend!',
      fromId,
      fromAgentName: 'Testy Tester',
      sessionId
    }
  ])

  const onAcceptFriendship = jest.fn()
  const onDeclineFriendship = jest.fn()
  const onClose = jest.fn()

  const rendered = mount(<Notifications
    notifications={allNotifications}
    acceptFriendship={onAcceptFriendship}
    declineFriendship={onDeclineFriendship}
    onClose={onClose}
  />)

  expect(rendered.find('p').text()).toBe('I would like to by your friend!')

  const buttons = rendered.find('button')
  expect(buttons.length).toBe(2)

  // Accept
  buttons.at(0).simulate('click')

  expect(onAcceptFriendship.mock.calls.length).toBe(1)
  expect(onDeclineFriendship.mock.calls.length).toBe(0)
  expect(onAcceptFriendship.mock.calls[0]).toEqual([
    fromId,
    sessionId
  ])

  expect(onClose.mock.calls.length).toBe(1)
  expect(onClose.mock.calls[0][0]).toBe(4)

  // Decline
  buttons.at(1).simulate('click')

  expect(onAcceptFriendship.mock.calls.length).toBe(1)
  expect(onDeclineFriendship.mock.calls.length).toBe(1)
  expect(onDeclineFriendship.mock.calls[0]).toEqual([
    fromId,
    sessionId
  ])

  expect(onClose.mock.calls.length).toBe(2)
  expect(onClose.mock.calls[1][0]).toBe(4)
})

test('should pass aXe', async () => {
  const allNotifications = Immutable.List([
    {
      id: 0,
      notificationType: 0,
      text: 'Test',
      callbackId: null
    }
  ])

  const rendered = mount(<Notifications
    notifications={allNotifications}
  />)

  expect(await axe(rendered.html())).toHaveNoViolations()
})
