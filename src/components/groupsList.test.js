import { axe } from 'jest-axe'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { v4 as uuid } from 'uuid'
import { render, fireEvent } from '@testing-library/react'

import GroupsList from './groupsList'

import { IMChatType } from '../types/chat'

function configureStore (state = {}) {
  const store = configureMockStore([thunk])
  return store(state)
}

it('renders without crashing', () => {
  const store = configureStore({
    groups: [
      {
        id: uuid(),
        name: 'Test Group',
        insigniaID: uuid(),
        title: 'Member of the Test Group',
        acceptNotices: true,
        powers: [0, 0]
      }
    ]
  })

  const { container } = render(<Provider store={store}>
    <GroupsList startNewIMChat={() => {}} />
  </Provider>)

  expect(container).toBeTruthy()
})

it('rendering', () => {
  const store = configureStore({
    groups: [
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
  })

  const { queryByText } = render(<Provider store={store}>
    <GroupsList startNewIMChat={() => {}} />
  </Provider>)

  expect(queryByText('Test Group')).toBeTruthy()

  expect(queryByText('The other Group')).toBeTruthy()
})

it('start chat', () => {
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

  const store = configureStore({ groups })

  const startNewIMChat = jest.fn()

  const { queryByAltText } = render(<Provider store={store}>
    <GroupsList startNewIMChat={startNewIMChat} />
  </Provider>)

  const newChatButton = queryByAltText('Start new chat with Test Group')
  expect(newChatButton).toBeTruthy()
  expect(newChatButton.nodeName).toBe('IMG')
  expect(newChatButton.parentElement).toBeTruthy()
  expect(newChatButton.parentElement.nodeName).toBe('BUTTON')

  fireEvent.click(newChatButton)

  expect(startNewIMChat.mock.calls.length).toBe(1)
  expect(startNewIMChat.mock.calls[0]).toEqual([
    IMChatType.group,
    groups[0].id,
    'Test Group'
  ])
})

it('should pass aXe', async () => {
  const store = configureStore({
    groups: [
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
  })

  const { container } = render(<Provider store={store}>
    <GroupsList startNewIMChat={() => {}} />
  </Provider>)

  expect(await axe(container)).toHaveNoViolations()
})
