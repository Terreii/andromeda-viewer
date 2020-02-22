import { axe } from 'jest-axe'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import AvatarName from '../../avatarName'
import {
  acceptFriendshipOffer,
  declineFriendshipOffer,
  offerTeleportLure,
  acceptTeleportLure,
  declineTeleportLure
} from '../../actions/friendsActions'
import { acceptGroupInvitation, declineGroupInvitation } from '../../actions/groupsActions'
import { acceptInventoryOffer, declineInventoryOffer } from '../../actions/inventory'
import { useName, useGroupName } from '../../hooks/names'

import { NotificationTypes } from '../../types/chat'
import { AssetType } from '../../types/inventory'
import { Maturity } from '../../types/viewer'

import Notifications from './index'

global.Array.prototype.flatMap = jest.fn(function (fn) {
  return [].concat(this.map(fn))
})

jest.mock('../../actions/friendsActions')
jest.mock('../../actions/groupsActions')
jest.mock('../../actions/inventory')
jest.mock('../../hooks/names')
const mockedName = 'Tester Mactestface'
beforeEach(() => {
  useName.mockReturnValueOnce(new AvatarName(mockedName))
})

function configureStore (state = {}) {
  const store = configureMockStore([thunk])
  return store(state)
}

function Container ({ store, children }) {
  return <Provider store={store}>
    {children}
  </Provider>
}

it('renders without crashing', () => {
  const allNotifications = [
    {
      id: 0,
      notificationType: NotificationTypes.TextOnly,
      text: 'Test',
      fromName: 'Tester'
    }
  ]

  render(<Notifications
    notifications={allNotifications}
  />)
})

it('renders a basic MessageBox', () => {
  const allNotifications = [
    {
      id: 4,
      notificationType: NotificationTypes.TextOnly,
      fromName: 'Tester',
      text: 'Test'
    }
  ]

  const store = configureStore()

  const onClose = jest.fn()

  const { queryByText } = render(<Container store={store}>
    <Notifications
      notifications={allNotifications}
      onClose={onClose}
    />
  </Container>)

  expect(queryByText('Tester')).toBeTruthy()
  expect(queryByText('Tester').nodeName).toBe('H4')

  expect(queryByText('Test')).toBeTruthy()
  expect(queryByText('Test').nodeName).toBe('P')

  const button = queryByText('OK')
  expect(button).toBeTruthy()
  expect(button.nodeName).toBe('BUTTON')

  fireEvent.click(button)

  expect(onClose.mock.calls.length).toBe(1)
  expect(onClose.mock.calls[0][0]).toBe(4)
})

it('renders a system MessageBox', () => {
  const allNotifications = [
    {
      id: 4,
      notificationType: NotificationTypes.System,
      text: 'Test'
    }
  ]

  const store = configureStore()

  const onClose = jest.fn()

  const { queryByText } = render(<Container store={store}>
    <Notifications
      notifications={allNotifications}
      onClose={onClose}
    />
  </Container>)

  const header = queryByText('System Notification')
  expect(header).toBeTruthy()
  expect(header.nodeName).toBe('H4')

  const body = queryByText('Test')
  expect(body).toBeTruthy()
  expect(body.nodeName).toBe('P')

  const button = queryByText('OK')
  expect(button).toBeTruthy()
  expect(button.nodeName).toBe('BUTTON')

  fireEvent.click(button)

  expect(onClose.mock.calls.length).toBe(1)
  expect(onClose.mock.calls[0][0]).toBe(4)
})

it('renders a friendship request', () => {
  acceptFriendshipOffer.mockImplementation(id => ({ type: 'FRIENDSHIP_ACCEPTED', agentId: id }))
  declineFriendshipOffer.mockImplementation(id => ({ type: 'FRIENDSHIP_DECLINED', agentId: id }))

  const store = configureStore()

  const fromId = '5df644f5-8b12-4caf-8e91-d7cae057e5f2'
  const sessionId = '84bcf978-fbb1-4fe8-b3fa-9d00e01a11d9'
  const allNotifications = [
    {
      id: 4,
      notificationType: NotificationTypes.FriendshipOffer,
      text: 'I would like to by your friend!',
      fromId,
      fromName: mockedName,
      sessionId
    }
  ]

  const onClose = jest.fn()

  const { queryByText } = render(<Container store={store}>
    <Notifications
      notifications={allNotifications}
      onClose={onClose}
    />
  </Container>)

  expect(queryByText('I would like to by your friend!')).toBeTruthy()
  expect(queryByText('I would like to by your friend!').nodeName).toBe('P')

  // Accept
  const acceptButton = queryByText('Accept')
  expect(acceptButton).toBeTruthy()
  expect(acceptButton.nodeName).toBe('BUTTON')

  fireEvent.click(acceptButton)
  expect(acceptFriendshipOffer.mock.calls).toEqual([
    [fromId, sessionId]
  ])
  expect(declineFriendshipOffer.mock.calls.length).toBe(0)

  expect(onClose.mock.calls.length).toBe(1)

  // Decline
  const declineButton = queryByText('Decline')
  expect(declineButton).toBeTruthy()
  expect(declineButton.nodeName).toBe('BUTTON')

  fireEvent.click(declineButton)
  expect(acceptFriendshipOffer.mock.calls).toEqual([
    [fromId, sessionId]
  ])
  expect(declineFriendshipOffer.mock.calls).toEqual([
    [fromId, sessionId]
  ])

  expect(onClose.mock.calls.length).toBe(2)
})

it('renders a group invitation', () => {
  acceptGroupInvitation.mockImplementation(() => () => {})
  declineGroupInvitation.mockImplementation(() => () => {})

  const store = configureStore()

  const transactionId = 'transactionId'
  const groupId = 'group id'

  const allNotifications = [
    {
      id: 4,
      notificationType: NotificationTypes.GroupInvitation,
      text: 'Join my group!',
      transactionId,
      groupId,
      roleId: 'general',
      fee: 0,
      name: 'Tester',
      useOfflineCap: false
    }
  ]

  const onClose = jest.fn()

  const { queryByText } = render(<Container store={store}>
    <Notifications
      notifications={allNotifications}
      onClose={onClose}
    />
  </Container>)

  expect(queryByText('Join my group!')).toBeTruthy()
  expect(queryByText('Join my group!').nodeName).toBe('P')

  const feeElement = queryByText('Fee:')
  expect(feeElement).toBeTruthy()
  expect(feeElement.textContent).toBe('Fee: 0L$')

  // Accept
  const acceptButton = queryByText('Accept')
  expect(acceptButton).toBeTruthy()
  expect(acceptButton.nodeName).toBe('BUTTON')

  fireEvent.click(acceptButton)
  expect(acceptGroupInvitation.mock.calls).toEqual([
    [transactionId, groupId]
  ])
  expect(declineGroupInvitation.mock.calls.length).toBe(0)

  expect(onClose.mock.calls.length).toBe(1)

  // Decline
  const declineButton = queryByText('Decline')
  expect(declineButton).toBeTruthy()
  expect(declineButton.nodeName).toBe('BUTTON')

  fireEvent.click(declineButton)
  expect(acceptGroupInvitation.mock.calls).toEqual([
    [transactionId, groupId]
  ])
  expect(declineGroupInvitation.mock.calls).toEqual([
    [transactionId, groupId]
  ])

  expect(onClose.mock.calls.length).toBe(2)
})

it('renders a group notice with items', () => {
  acceptInventoryOffer.mockImplementation(() => () => {})
  declineInventoryOffer.mockImplementation(() => () => {})
  useGroupName.mockReturnValueOnce('Tester Group')

  const store = configureStore()

  const transactionId = 'transactionId'
  const groupId = 'group id'
  const senderId = 'dcba'

  const data = [
    {
      id: 4,
      notificationType: NotificationTypes.GroupNotice,
      title: 'New stuff',
      text: 'Changes in this group:\n- a\n- b',
      groupId,
      senderName: mockedName,
      senderId,
      time: Date.now(),
      item: {
        name: 'itemName',
        type: AssetType.ImageJPEG,
        transactionId
      }
    }
  ]

  const onClose = jest.fn()

  // With item
  const { queryByText } = render(<Container store={store}>
    <Notifications
      notifications={data}
      onClose={onClose}
    />
  </Container>)

  expect(queryByText('Group Notice from Tester Group - New stuff')).toBeTruthy()
  expect(queryByText('Group Notice from Tester Group - New stuff').nodeName).toBe('H4')

  expect(queryByText('Changes in this group:- a- b')).toBeTruthy()
  expect(queryByText('Changes in this group:- a- b').nodeName).toBe('P')

  // Accept
  const acceptButton = queryByText('Save item')
  expect(acceptButton).toBeTruthy()
  expect(acceptButton.nodeName).toBe('BUTTON')

  fireEvent.click(acceptButton)
  expect(acceptInventoryOffer.mock.calls).toEqual([
    [
      senderId,
      transactionId,
      AssetType.ImageJPEG,
      true
    ]
  ])
  expect(declineInventoryOffer.mock.calls.length).toBe(0)

  expect(onClose.mock.calls.length).toBe(1)

  // Decline
  const declineButton = queryByText('Decline item')
  expect(declineButton).toBeTruthy()
  expect(declineButton.nodeName).toBe('BUTTON')

  fireEvent.click(declineButton)
  expect(acceptInventoryOffer.mock.calls).toEqual([
    [
      senderId,
      transactionId,
      AssetType.ImageJPEG,
      true
    ]
  ])
  expect(declineInventoryOffer.mock.calls).toEqual([
    [
      senderId,
      transactionId,
      true
    ]
  ])

  expect(onClose.mock.calls.length).toBe(2)
  expect(onClose.mock.calls[1][0]).toBe(4)
})

it('renders a group notice without item', () => {
  acceptInventoryOffer.mockImplementation(() => () => {})
  declineInventoryOffer.mockImplementation(() => () => {})
  useGroupName.mockReturnValueOnce('Tester Group')

  const store = configureStore()

  const groupId = 'group id'
  const senderId = 'dcba'

  const data = [
    {
      id: 4,
      notificationType: NotificationTypes.GroupNotice,
      title: 'New stuff',
      text: 'Changes in this group:\n- a\n- b',
      groupId,
      senderName: mockedName,
      senderId,
      time: Date.now(),
      item: null
    }
  ]

  const onClose = jest.fn()

  // With item
  const { queryByText } = render(<Container store={store}>
    <Notifications
      notifications={data}
      onClose={onClose}
    />
  </Container>)

  expect(queryByText('Group Notice from Tester Group - New stuff')).toBeTruthy()
  expect(queryByText('Group Notice from Tester Group - New stuff').nodeName).toBe('H4')

  expect(queryByText('Changes in this group:- a- b')).toBeTruthy()
  expect(queryByText('Changes in this group:- a- b').nodeName).toBe('P')

  // Accept and decline buttons
  expect(queryByText('Save item')).toBeNull()
  expect(queryByText('Decline item')).toBeNull()

  // Button
  const okButton = queryByText('OK')
  expect(okButton).toBeTruthy()
  expect(okButton.nodeName).toBe('BUTTON')

  const acceptCount = acceptInventoryOffer.mock.calls.length
  const declineCount = declineInventoryOffer.mock.calls.length

  fireEvent.click(okButton)

  expect(acceptInventoryOffer.mock.calls.length).toBe(acceptCount)
  expect(declineInventoryOffer.mock.calls.length).toBe(declineCount)

  expect(onClose.mock.calls.length).toBe(1)
  expect(onClose.mock.calls[0][0]).toBe(4)
})

it('renders an open URL', () => {
  const href = 'https://secondlife.com/support/downloads/'
  const onClose = jest.fn()

  const store = configureStore()

  const { container, queryByText } = render(<Container store={store}>
    <Notifications
      notifications={[
        {
          id: 1,
          notificationType: NotificationTypes.LoadURL,
          text: 'Please go to this URL',
          url: href,
          fromId: 'Abcd',
          fromName: 'Tester'
        }
      ]}
      onClose={onClose}
    />
  </Container>)

  const a = container.querySelector(`a[href="${href}"]`)
  expect(a).toBeTruthy()
  expect(a.target).toBe('_blank')
  expect(a.rel).toBe('noopener noreferrer')
  expect(a.textContent).toBe(href)

  const button = queryByText('OK')
  expect(button).toBeTruthy()
  expect(button.nodeName).toBe('BUTTON')

  fireEvent.click(button)

  expect(onClose.mock.calls.length).toBe(1)
  expect(onClose.mock.calls[0][0]).toBe(1)
})

it('renders a request teleport lure', () => {
  offerTeleportLure.mockImplementation(() => () => {})

  const store = configureStore()

  const senderId = '1234567890'
  const onAccept = jest.fn()
  const onClose = jest.fn()

  const { queryByText } = render(<Container store={store}>
    <Notifications
      notifications={[
        {
          id: 1,
          notificationType: NotificationTypes.RequestTeleportLure,
          text: 'Please teleport me to you.',
          fromId: senderId,
          fromName: mockedName
        }
      ]}
      offerTeleport={onAccept}
      onClose={onClose}
    />
  </Container>)

  expect(queryByText(mockedName + ' is requesting to be teleported to your location.'))
    .toBeTruthy()

  // Accept
  const acceptButton = queryByText('Accept')
  expect(acceptButton).toBeTruthy()
  expect(acceptButton.nodeName).toBe('BUTTON')

  fireEvent.click(acceptButton)

  expect(offerTeleportLure.mock.calls.length).toBe(1)
  expect(offerTeleportLure.mock.calls[0]).toEqual([
    senderId
  ])

  expect(onClose.mock.calls.length).toBe(1)
  expect(onClose.mock.calls[0][0]).toBe(1)

  // Decline
  const declineButton = queryByText('Decline')
  expect(declineButton).toBeTruthy()
  expect(declineButton.nodeName).toBe('BUTTON')

  fireEvent.click(declineButton)

  expect(offerTeleportLure.mock.calls.length).toBe(1)

  expect(onClose.mock.calls.length).toBe(2)
  expect(onClose.mock.calls[1][0]).toBe(1)
})

it('renders a teleport lure', () => {
  acceptTeleportLure.mockImplementation(() => () => {})
  declineTeleportLure.mockImplementation(() => () => {})

  const store = configureStore()

  const onClose = jest.fn()

  const senderId = 'abcdef'
  const lureId = 'fedcba'

  const { queryByText } = render(<Container store={store}>
    <Notifications
      notifications={[
        {
          id: 1,
          notificationType: NotificationTypes.TeleportLure,
          text: 'Join me at my location!',
          fromId: senderId,
          fromName: mockedName,
          lureId,
          regionId: [123, 123],
          position: [28, 29, 30],
          lockAt: [0, 1, 2],
          maturity: Maturity.General,
          godLike: false
        }
      ]}
      onClose={onClose}
    />
  </Container>)

  expect(queryByText(`${mockedName} has offered to teleport you to their location.`))
    .toBeTruthy()

  // Accept
  const acceptButton = queryByText('Accept (not yet implemented)')
  expect(acceptButton).toBeTruthy()
  expect(acceptButton.nodeName).toBe('BUTTON')
  expect(acceptButton.disabled).toBeTruthy()

  expect(acceptTeleportLure.mock.calls.length).toBe(0)
  // expect(acceptTeleportLure.mock.calls[0]).toEqual([
  //   senderId,
  //   lureId
  // ])

  expect(declineTeleportLure.mock.calls.length).toBe(0)

  expect(onClose.mock.calls.length).toBe(0)

  // Decline
  const declineButton = queryByText('Decline')
  expect(declineButton).toBeTruthy()
  expect(declineButton.nodeName).toBe('BUTTON')

  fireEvent.click(declineButton)

  expect(acceptTeleportLure.mock.calls.length).toBe(0)

  expect(declineTeleportLure.mock.calls.length).toBe(1)
  expect(declineTeleportLure.mock.calls[0]).toEqual([
    senderId,
    lureId
  ])

  expect(onClose.mock.calls.length).toBe(1)
  expect(onClose.mock.calls[0][0]).toBe(1)
})

it('renders a inventory offer', () => {
  acceptInventoryOffer.mockImplementation(() => () => {})
  declineInventoryOffer.mockImplementation(() => () => {})

  const store = configureStore()

  const transactionId = 'transactionId'
  const fromId = '5df644f5-8b12-4caf-8e91-d7cae057e5f2'

  const allNotifications = [
    {
      id: 4,
      notificationType: NotificationTypes.InventoryOffered,
      text: 'Here is my offer!',
      fromObject: false,
      fromGroup: false,
      fromId,
      fromName: mockedName,
      item: {
        objectId: 'fedcba',
        type: AssetType.ImageJPEG,
        transactionId
      }
    }
  ]

  const acceptCount = acceptInventoryOffer.mock.calls.length
  const declineCount = declineInventoryOffer.mock.calls.length
  const onClose = jest.fn()

  const { queryByText } = render(<Container store={store}>
    <Notifications
      notifications={allNotifications}
      onClose={onClose}
    />
  </Container>)

  expect(queryByText('Here is my offer!')).toBeTruthy()

  // Accept
  const acceptButton = queryByText('Accept')
  expect(acceptButton).toBeTruthy()
  expect(acceptButton.nodeName).toBe('BUTTON')

  fireEvent.click(acceptButton)

  expect(acceptInventoryOffer.mock.calls.length).toBe(acceptCount + 1)
  expect(declineInventoryOffer.mock.calls.length).toBe(declineCount + 0)
  expect(acceptInventoryOffer.mock.calls[acceptCount]).toEqual([
    fromId,
    transactionId,
    AssetType.ImageJPEG,
    false,
    false
  ])

  expect(onClose.mock.calls.length).toBe(1)
  expect(onClose.mock.calls[0][0]).toBe(4)

  // Decline
  const declineButton = queryByText('Decline')
  expect(declineButton).toBeTruthy()
  expect(declineButton.nodeName).toBe('BUTTON')

  fireEvent.click(declineButton)

  expect(acceptInventoryOffer.mock.calls.length).toBe(acceptCount + 1)
  expect(declineInventoryOffer.mock.calls.length).toBe(declineCount + 1)
  expect(declineInventoryOffer.mock.calls[declineCount]).toEqual([
    fromId,
    transactionId,
    false,
    false
  ])

  expect(onClose.mock.calls.length).toBe(2)
  expect(onClose.mock.calls[1][0]).toBe(4)
})

it('should pass aXe', async () => {
  const allNotifications = [
    {
      id: 0,
      notificationType: NotificationTypes.TextOnly,
      text: 'Test',
      fromName: 'Tester'
    },
    {
      id: 1,
      notificationType: NotificationTypes.System,
      text: 'Test'
    },
    {
      id: 2,
      notificationType: NotificationTypes.FriendshipOffer,
      text: 'I would like to by your friend!',
      fromId: '5df644f5-8b12-4caf-8e91-d7cae057e5f2',
      fromName: 'Testy Tester',
      sessionId: '84bcf978-fbb1-4fe8-b3fa-9d00e01a11d9'
    },
    {
      id: 3,
      notificationType: NotificationTypes.GroupInvitation,
      text: 'Join my group!',
      transactionId: 'transactionId',
      groupId: 'group id',
      roleId: 'general',
      fee: 0,
      name: 'Tester',
      useOfflineCap: false
    },
    {
      id: 4,
      notificationType: NotificationTypes.GroupNotice,
      title: 'New stuff',
      text: 'Changes in this group:\n- a\n- b',
      groupId: 'abcd',
      senderName: 'Tester',
      senderId: '5df644f5-8b12-4caf-8e91-d7cae057e5f2',
      time: Date.now(),
      item: {
        name: 'itemName',
        type: AssetType.ImageJPEG,
        transactionId: 'xyz'
      }
    },
    {
      id: 5,
      notificationType: NotificationTypes.GroupNotice,
      title: 'New stuff',
      text: 'Changes in this group:\n- a\n- b',
      groupId: 'abcd',
      senderName: 'Tester',
      senderId: '5df644f5-8b12-4caf-8e91-d7cae057e5f2',
      time: Date.now(),
      item: null
    },
    {
      id: 6,
      notificationType: NotificationTypes.LoadURL,
      text: 'Please go to this URL',
      url: 'https://secondlife.com/support/downloads/',
      fromId: 'Abcd',
      fromName: 'Tester'
    },
    {
      id: 7,
      notificationType: NotificationTypes.RequestTeleportLure,
      text: 'Please teleport me to you.',
      fromId: '5df644f5-8b12-4caf-8e91-d7cae057e5f2',
      fromName: 'Tester'
    },
    {
      id: 8,
      notificationType: NotificationTypes.TeleportLure,
      text: 'Join me at my location!',
      fromId: '5df644f5-8b12-4caf-8e91-d7cae057e5f2',
      fromName: 'Tester MacTestface',
      lureId: 'fedcba',
      regionId: [123, 123],
      position: [28, 29, 30],
      lockAt: [0, 1, 2],
      maturity: Maturity.General,
      godLike: false
    },
    {
      id: 9,
      notificationType: NotificationTypes.InventoryOffered,
      text: 'Here is my offer!',
      fromObject: false,
      fromGroup: false,
      fromId: '5df644f5-8b12-4caf-8e91-d7cae057e5f2',
      fromName: 'Tester MacTestface',
      item: {
        objectId: 'fedcba',
        type: AssetType.ImageJPEG,
        transactionId: 'xyz'
      }
    }
  ]

  const store = configureStore()

  const { container } = render(<Container store={store}>
    <Notifications notifications={allNotifications} />
  </Container>)

  expect(await axe(container)).toHaveNoViolations()
})
