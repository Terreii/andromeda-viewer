import { axe } from 'jest-axe'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { render, fireEvent } from '@testing-library/react'

import FriendsList from './friendsList'
import AvatarName from '../avatarName'

import { updateRights } from '../actions/friendsActions'

import { IMChatType } from '../types/chat'

jest.mock('../actions/friendsActions')

function configureStore (state = {}) {
  const store = configureMockStore([thunk])
  return store(state)
}

it('renders without crashing', () => {
  const names = {
    first: new AvatarName('Testery MacTestface')
  }

  const store = configureStore({
    friends: [
      {
        id: 'first',
        rightsGiven: {},
        rightsHas: {}
      }
    ]
  })

  const { container } = render(
    <Provider store={store}>
      <FriendsList names={names} />
    </Provider>
  )

  expect(container).toBeTruthy()
})

it('rendering', () => {
  const names = {
    first: new AvatarName('Testery MacTestface'),
    other: new AvatarName('Buddy Budds')
  }

  const store = configureStore({
    friends: [
      {
        id: 'first',
        online: true,
        rightsGiven: {
          canSeeOnline: true,
          canSeeOnMap: false,
          canModifyObjects: true
        },
        rightsHas: {
          canSeeOnline: true,
          canSeeOnMap: false,
          canModifyObjects: true
        }
      },
      {
        id: 'other',
        online: false,
        rightsGiven: {
          canSeeOnline: false,
          canSeeOnMap: true,
          canModifyObjects: false
        },
        rightsHas: {
          canSeeOnline: false,
          canSeeOnMap: true,
          canModifyObjects: false
        }
      }
    ]
  })

  const { queryByText, queryAllByAltText } = render(
    <Provider store={store}>
      <FriendsList names={names} />
    </Provider>
  )

  const first = queryByText('Testery Mactestface')
  expect(first).toBeTruthy()
  expect(first.parentElement.nodeName).toBe('LI')

  expect(queryAllByAltText('Start new chat with Testery Mactestface')).toBeTruthy()

  const second = queryByText('Buddy Budds')
  expect(second).toBeTruthy()
  expect(second.parentElement.nodeName).toBe('LI')

  expect(queryAllByAltText('Start new chat with Buddy Budds')).toBeTruthy()
})

it('shows the online state of friends', () => {
  const names = {
    first: new AvatarName('Testery MacTestface'),
    other: new AvatarName('Buddy Budds')
  }

  const store = configureStore({
    friends: [
      {
        id: 'first',
        online: true,
        rightsGiven: {
          canSeeOnline: true,
          canSeeOnMap: false,
          canModifyObjects: true
        },
        rightsHas: {
          canSeeOnline: true,
          canSeeOnMap: false,
          canModifyObjects: true
        }
      },
      {
        id: 'other',
        online: false,
        rightsGiven: {
          canSeeOnline: false,
          canSeeOnMap: true,
          canModifyObjects: false
        },
        rightsHas: {
          canSeeOnline: false,
          canSeeOnMap: true,
          canModifyObjects: false
        }
      }
    ]
  })

  const { queryByTitle, queryByLabelText } = render(
    <Provider store={store}>
      <FriendsList names={names} />
    </Provider>
  )

  expect(queryByLabelText('online')).toBeTruthy()
  expect(queryByTitle('online')).toBeTruthy()
  expect(queryByLabelText('online')).toBe(queryByTitle('online'))

  expect(queryByLabelText('offline')).toBeTruthy()
  expect(queryByTitle('offline')).toBeTruthy()
  expect(queryByLabelText('offline')).toBe(queryByTitle('offline'))
})

it('event handling/changing rights', () => {
  updateRights.mockImplementation(() => () => {})

  const store = configureStore({
    friends: [
      {
        id: 'first',
        online: true,
        rightsGiven: {
          canSeeOnline: false,
          canSeeOnMap: false,
          canModifyObjects: false
        },
        rightsHas: {
          canSeeOnline: false,
          canSeeOnMap: false,
          canModifyObjects: false
        }
      }
    ]
  })

  const names = {
    first: new AvatarName('Testery MacTestface')
  }

  const { queryByTitle } = render(
    <Provider store={store}>
      <FriendsList names={names} />
    </Provider>
  )

  const friendCanSeeOnline = queryByTitle("Friend can see when you're online")
  expect(friendCanSeeOnline).toBeTruthy()
  expect(friendCanSeeOnline.disabled).toBeFalsy()
  expect(friendCanSeeOnline.type).toBe('checkbox')

  fireEvent.click(friendCanSeeOnline)
  expect(updateRights).lastCalledWith('first', { canSeeOnline: true })

  const friendCanSeeMap = queryByTitle('Friend can locate you on the map')
  expect(friendCanSeeMap).toBeTruthy()
  expect(friendCanSeeMap.disabled).toBeFalsy()
  expect(friendCanSeeMap.type).toBe('checkbox')

  fireEvent.click(friendCanSeeMap)
  expect(updateRights).lastCalledWith('first', { canSeeOnMap: true })

  const friendCanChangeObjects = queryByTitle('Friend can edit, delete or take objects')
  expect(friendCanChangeObjects).toBeTruthy()
  expect(friendCanChangeObjects.disabled).toBeFalsy()
  expect(friendCanChangeObjects.type).toBe('checkbox')

  fireEvent.click(friendCanChangeObjects)
  expect(updateRights).lastCalledWith('first', { canModifyObjects: true })

  const changeCounts = updateRights.mock.calls.length

  const youCanSeeMap = queryByTitle('You can locate them on the map')
  expect(youCanSeeMap).toBeTruthy()
  expect(youCanSeeMap.disabled).toBeTruthy()
  expect(youCanSeeMap.type).toBe('checkbox')

  fireEvent.click(youCanSeeMap)

  const youCanChangeObjects = queryByTitle("You can edit this friend's objects")
  expect(youCanChangeObjects).toBeTruthy()
  expect(youCanChangeObjects.disabled).toBeTruthy()
  expect(youCanChangeObjects.type).toBe('checkbox')

  fireEvent.click(youCanChangeObjects)

  expect(updateRights).toBeCalledTimes(changeCounts)
})

it('should handle creating a new chat', () => {
  const store = configureStore({
    friends: [
      {
        id: 'first',
        online: true,
        rightsGiven: {
          canSeeOnline: false,
          canSeeOnMap: false,
          canModifyObjects: false
        },
        rightsHas: {
          canSeeOnline: false,
          canSeeOnMap: false,
          canModifyObjects: false
        }
      }
    ]
  })

  const names = {
    first: new AvatarName('Testery MacTestface')
  }

  const startNewIMChat = jest.fn()

  const { queryByAltText } = render(
    <Provider store={store}>
      <FriendsList
        names={names}
        startNewIMChat={startNewIMChat}
      />
    </Provider>
  )

  const newChatButton = queryByAltText('Start new chat with Testery Mactestface')
  expect(newChatButton).toBeTruthy()
  expect(newChatButton.nodeName).toBe('IMG')
  expect(newChatButton.parentElement).toBeTruthy()
  expect(newChatButton.parentElement.nodeName).toBe('BUTTON')

  fireEvent.click(newChatButton)

  expect(startNewIMChat).lastCalledWith(IMChatType.personal, 'first', 'Testery Mactestface')
})

it('should pass aXe', async () => {
  const names = {
    first: new AvatarName('Testery MacTestface')
  }

  const store = configureStore({
    friends: [
      {
        id: 'first',
        online: true,
        rightsGiven: {},
        rightsHas: {}
      }
    ]
  })

  const { container } = render(
    <Provider store={store}>
      <FriendsList names={names} />
    </Provider>
  )

  expect(await axe(container)).toHaveNoViolations()
})
