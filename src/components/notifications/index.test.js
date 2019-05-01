import { axe } from 'jest-axe'
import React from 'react'
import { mount } from 'enzyme'
import Immutable from 'immutable'

import Notifications from './index'

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
      text: 'Test',
      callbackId: null
    }
  ])

  let onCancelCount = 0
  let onClickCount = 0

  const rendered = mount(<Notifications
    notifications={allNotifications}
    onClick={() => {
      onClickCount += 1
    }}
    onCancel={id => {
      onCancelCount += 1
      expect(id).toBe(4)
    }}
  />)

  expect(rendered.find('p').text()).toBe('Test')

  const buttons = rendered.find('button')
  expect(buttons.length).toBe(1)
  buttons.at(0).simulate('click')

  expect(onCancelCount).toBe(1)
  expect(onClickCount).toBe(0)
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
