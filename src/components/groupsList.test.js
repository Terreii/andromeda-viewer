import { axe } from 'jest-axe'
import React from 'react'
import { mount } from 'enzyme'
import { v4 as uuid } from 'uuid'

import GroupsList from './groupsList'

import { IMChatType } from '../types/chat'

test('renders without crashing', () => {
  const groups = [
    {
      id: uuid(),
      name: 'Test Group',
      insigniaID: uuid(),
      title: 'Member of the Test Group',
      acceptNotices: true,
      powers: [0, 0]
    }
  ]

  mount(<GroupsList groups={groups} startNewIMChat={() => {}} />)
})

test('rendering', () => {
  const groups = [
    {
      id: uuid(),
      name: 'Test Group',
      insigniaID: uuid(),
      title: 'Member of the Test Group',
      acceptNotices: true,
      powers: [0, 0]
    },
    {
      id: uuid(),
      name: 'The other Group',
      insigniaID: uuid(),
      title: 'Just another group',
      acceptNotices: true,
      powers: [2048, 134283266]
    }
  ]

  const rendered = mount(<GroupsList groups={groups} startNewIMChat={() => {}} />)

  const liElements = rendered.find('li')
  expect(liElements.length).toBe(2)

  liElements.forEach((row, index) => {
    const isFirst = index === 0

    expect(row.find('img[src="chat_bubble.svg"]').prop('alt'))
      .toBe('Start new chat with ' + (isFirst ? 'Test Group' : 'The other Group'))

    expect(row.first().text()).toBe(isFirst ? 'Test Group' : 'The other Group')
  })
})

test('start chat', () => {
  const groups = [
    {
      id: uuid(),
      name: 'Test Group',
      insigniaID: uuid(),
      title: 'Member of the Test Group',
      acceptNotices: true,
      powers: [0, 0]
    }
  ]
  const startNewIMChat = jest.fn()

  const rendered = mount(<GroupsList
    groups={groups}
    startNewIMChat={startNewIMChat}
  />)

  const newChatButton = rendered.find('button')
  newChatButton.simulate('click')

  expect(startNewIMChat.mock.calls.length).toBe(1)
  expect(startNewIMChat.mock.calls[0]).toEqual([
    IMChatType.group,
    groups[0].id,
    'Test Group'
  ])
})

test('should pass aXe', async () => {
  const groups = [
    {
      id: uuid(),
      name: 'Test Group',
      insigniaID: uuid(),
      title: 'Member of the Test Group',
      acceptNotices: true,
      powers: [0, 0]
    },
    {
      id: uuid(),
      name: 'The other Group',
      insigniaID: uuid(),
      title: 'Just another group',
      acceptNotices: true,
      powers: [2048, 134283266]
    }
  ]

  const rendered = mount(<GroupsList groups={groups} startNewIMChat={() => {}} />)

  expect(await axe(rendered.html())).toHaveNoViolations()
})
