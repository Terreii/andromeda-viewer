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
import { close, selectNotifications } from '../../bundles/notifications'
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
jest.mock('../../bundles/notifications')
jest.mock('../../hooks/names')
const mockedName = 'Tester Mactestface'
beforeEach(() => {
  useName.mockReturnValueOnce(new AvatarName(mockedName))
  close.mockImplementation(() => () => {})
})

function configureStore (state = {}) {
  const store = configureMockStore([thunk])
  return store(state)
}

it('renders without crashing', () => {
  selectNotifications.mockReturnValue([
    {
      id: 0,
      notificationType: NotificationTypes.TextOnly,
      text: 'Test',
      fromName: 'Tester'
    }
  ])

  const store = configureStore()

  render(
    <Provider store={store}>
      <Notifications />
    </Provider>
  )
})

it('renders a basic MessageBox', () => {
  selectNotifications.mockReturnValue([
    {
      id: 4,
      notificationType: NotificationTypes.TextOnly,
      fromName: 'Tester',
      text: 'Test'
    }
  ])

  const store = configureStore()

  const closeCount = close.mock.calls.length

  const { queryByText } = render(
    <Provider store={store}>
      <Notifications />
    </Provider>
  )

  expect(queryByText('Tester')).toBeTruthy()
  expect(queryByText('Tester').nodeName).toBe('H4')

  expect(queryByText('Test')).toBeTruthy()
  expect(queryByText('Test').nodeName).toBe('P')

  const button = queryByText('OK')
  expect(button).toBeTruthy()
  expect(button.nodeName).toBe('BUTTON')

  fireEvent.click(button)

  expect(close).toBeCalledTimes(closeCount + 1)
  expect(close).lastCalledWith(4)
})

it('renders a system MessageBox', () => {
  selectNotifications.mockReturnValue([
    {
      id: 4,
      notificationType: NotificationTypes.System,
      text: 'Test'
    }
  ])

  const store = configureStore()

  const closeCount = close.mock.calls.length

  const { queryByText } = render(
    <Provider store={store}>
      <Notifications />
    </Provider>
  )

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

  expect(close).toBeCalledTimes(closeCount + 1)
  expect(close).lastCalledWith(4)
})

it('renders a friend online state change notification to online', () => {
  selectNotifications.mockReturnValue([
    {
      id: 4,
      notificationType: NotificationTypes.FriendOnlineStateChange,
      friendId: '5df644f5-8b12-4caf-8e91-d7cae057e5f2',
      online: true,
      text: ''
    }
  ])

  const store = configureStore()

  const closeCount = close.mock.calls.length

  const { queryByText } = render(
    <Provider store={store}>
      <Notifications />
    </Provider>
  )

  const header = queryByText('Friend went online')
  expect(header).toBeTruthy()
  expect(header.nodeName).toBe('H4')

  const body = queryByText('Tester Mactestface is online')
  expect(body).toBeTruthy()
  expect(body.nodeName).toBe('P')

  const button = queryByText('OK')
  expect(button).toBeTruthy()
  expect(button.nodeName).toBe('BUTTON')

  fireEvent.click(button)

  expect(close).toBeCalledTimes(closeCount + 1)
  expect(close).lastCalledWith(4)
})

it('renders a friend online state change notification to offline', () => {
  selectNotifications.mockReturnValue([
    {
      id: 4,
      notificationType: NotificationTypes.FriendOnlineStateChange,
      friendId: '5df644f5-8b12-4caf-8e91-d7cae057e5f2',
      online: false,
      text: ''
    }
  ])

  const store = configureStore()

  const closeCount = close.mock.calls.length

  const { queryByText } = render(
    <Provider store={store}>
      <Notifications />
    </Provider>
  )

  const header = queryByText('Friend went offline')
  expect(header).toBeTruthy()
  expect(header.nodeName).toBe('H4')

  const body = queryByText('Tester Mactestface is offline')
  expect(body).toBeTruthy()
  expect(body.nodeName).toBe('P')

  const button = queryByText('OK')
  expect(button).toBeTruthy()
  expect(button.nodeName).toBe('BUTTON')

  fireEvent.click(button)

  expect(close).toBeCalledTimes(closeCount + 1)
  expect(close).lastCalledWith(4)
})

it('renders a friendship request', () => {
  acceptFriendshipOffer.mockImplementation(id => ({ type: 'FRIENDSHIP_ACCEPTED', agentId: id }))
  declineFriendshipOffer.mockImplementation(id => ({ type: 'FRIENDSHIP_DECLINED', agentId: id }))

  const store = configureStore()

  const closeCount = close.mock.calls.length

  const fromId = '5df644f5-8b12-4caf-8e91-d7cae057e5f2'
  const sessionId = '84bcf978-fbb1-4fe8-b3fa-9d00e01a11d9'
  selectNotifications.mockReturnValue([
    {
      id: 4,
      notificationType: NotificationTypes.FriendshipOffer,
      text: 'I would like to by your friend!',
      fromId,
      fromName: mockedName,
      sessionId
    }
  ])

  const { queryByText } = render(
    <Provider store={store}>
      <Notifications />
    </Provider>
  )

  expect(queryByText('I would like to by your friend!')).toBeTruthy()
  expect(queryByText('I would like to by your friend!').nodeName).toBe('P')

  // Accept
  const acceptButton = queryByText('Accept')
  expect(acceptButton).toBeTruthy()
  expect(acceptButton.nodeName).toBe('BUTTON')

  fireEvent.click(acceptButton)
  expect(acceptFriendshipOffer).lastCalledWith(fromId, sessionId)
  expect(declineFriendshipOffer).not.toBeCalled()

  expect(close).toBeCalledTimes(closeCount + 1)
  expect(close).lastCalledWith(4)

  // Decline
  const declineButton = queryByText('Decline')
  expect(declineButton).toBeTruthy()
  expect(declineButton.nodeName).toBe('BUTTON')

  fireEvent.click(declineButton)
  expect(acceptFriendshipOffer).toBeCalledTimes(1)
  expect(declineFriendshipOffer).lastCalledWith(fromId, sessionId)

  expect(close).toBeCalledTimes(closeCount + 2)
  expect(close).lastCalledWith(4)
})

it('renders a group invitation', () => {
  acceptGroupInvitation.mockImplementation(() => () => {})
  declineGroupInvitation.mockImplementation(() => () => {})

  const store = configureStore()

  const closeCount = close.mock.calls.length

  const transactionId = 'transactionId'
  const groupId = 'group id'

  selectNotifications.mockReturnValue([
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
  ])

  const { queryByText } = render(
    <Provider store={store}>
      <Notifications />
    </Provider>
  )

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
  expect(acceptGroupInvitation).lastCalledWith(transactionId, groupId)
  expect(declineGroupInvitation).not.toBeCalled()

  expect(close).toBeCalledTimes(closeCount + 1)
  expect(close).lastCalledWith(4)

  // Decline
  const declineButton = queryByText('Decline')
  expect(declineButton).toBeTruthy()
  expect(declineButton.nodeName).toBe('BUTTON')

  fireEvent.click(declineButton)
  expect(acceptGroupInvitation).toBeCalledTimes(1)
  expect(declineGroupInvitation).lastCalledWith(transactionId, groupId)

  expect(close).toBeCalledTimes(closeCount + 2)
  expect(close).lastCalledWith(4)
})

it('renders a group notice with items', () => {
  acceptInventoryOffer.mockImplementation(() => () => {})
  declineInventoryOffer.mockImplementation(() => () => {})
  useGroupName.mockReturnValueOnce('Tester Group')

  const store = configureStore()

  const closeCount = close.mock.calls.length

  const transactionId = 'transactionId'
  const groupId = 'group id'
  const senderId = 'dcba'

  selectNotifications.mockReturnValue([
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
  ])

  // With item
  const { queryByText } = render(
    <Provider store={store}>
      <Notifications />
    </Provider>
  )

  expect(queryByText('Group Notice from Tester Group - New stuff')).toBeTruthy()
  expect(queryByText('Group Notice from Tester Group - New stuff').nodeName).toBe('H4')

  expect(queryByText('Changes in this group:- a- b')).toBeTruthy()
  expect(queryByText('Changes in this group:- a- b').nodeName).toBe('P')

  // Accept
  const acceptButton = queryByText('Save item')
  expect(acceptButton).toBeTruthy()
  expect(acceptButton.nodeName).toBe('BUTTON')

  fireEvent.click(acceptButton)
  expect(acceptInventoryOffer)
    .lastCalledWith(senderId, transactionId, AssetType.ImageJPEG, true)
  expect(declineInventoryOffer).not.toBeCalled()

  expect(close).toBeCalledTimes(closeCount + 1)
  expect(close).lastCalledWith(4)

  // Decline
  const declineButton = queryByText('Decline item')
  expect(declineButton).toBeTruthy()
  expect(declineButton.nodeName).toBe('BUTTON')

  fireEvent.click(declineButton)
  expect(acceptInventoryOffer.mock.calls.length).toBe(1)
  expect(declineInventoryOffer)
    .lastCalledWith(senderId, transactionId, true)

  expect(close).toBeCalledTimes(closeCount + 2)
  expect(close).lastCalledWith(4)
})

it('renders a group notice without item', () => {
  acceptInventoryOffer.mockImplementation(() => () => {})
  declineInventoryOffer.mockImplementation(() => () => {})
  useGroupName.mockReturnValueOnce('Tester Group')

  const store = configureStore()

  const closeCount = close.mock.calls.length

  const groupId = 'group id'
  const senderId = 'dcba'

  selectNotifications.mockReturnValue([
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
  ])

  // With item
  const { queryByText } = render(
    <Provider store={store}>
      <Notifications />
    </Provider>
  )

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

  expect(acceptInventoryOffer).toBeCalledTimes(acceptCount)
  expect(declineInventoryOffer).toBeCalledTimes(declineCount)

  expect(close).toBeCalledTimes(closeCount + 1)
  expect(close).lastCalledWith(4)
})

it('renders an open URL', () => {
  const href = 'https://secondlife.com/support/downloads/'

  const store = configureStore()

  selectNotifications.mockReturnValue([
    {
      id: 1,
      notificationType: NotificationTypes.LoadURL,
      text: 'Please go to this URL',
      url: href,
      fromId: 'Abcd',
      fromName: 'Tester'
    }
  ])

  const closeCount = close.mock.calls.length

  const { container, queryByText } = render(
    <Provider store={store}>
      <Notifications />
    </Provider>
  )

  const a = container.querySelector(`a[href="${href}"]`)
  expect(a).toBeTruthy()
  expect(a.target).toBe('_blank')
  expect(a.rel).toBe('noopener noreferrer')
  expect(a.textContent).toBe(href)

  const button = queryByText('OK')
  expect(button).toBeTruthy()
  expect(button.nodeName).toBe('BUTTON')

  fireEvent.click(button)

  expect(close).toBeCalledTimes(closeCount + 1)
  expect(close).lastCalledWith(1)
})

it('renders a request teleport lure', () => {
  const senderId = '1234567890'

  offerTeleportLure.mockImplementation(() => () => {})
  selectNotifications.mockReturnValue([
    {
      id: 1,
      notificationType: NotificationTypes.RequestTeleportLure,
      text: 'Please teleport me to you.',
      fromId: senderId,
      fromName: mockedName
    }
  ])

  const store = configureStore()

  const closeCount = close.mock.calls.length

  const { queryByText } = render(
    <Provider store={store}>
      <Notifications />
    </Provider>
  )

  expect(queryByText(mockedName + ' is requesting to be teleported to your location.'))
    .toBeTruthy()

  // Accept
  const acceptButton = queryByText('Accept')
  expect(acceptButton).toBeTruthy()
  expect(acceptButton.nodeName).toBe('BUTTON')

  fireEvent.click(acceptButton)

  expect(offerTeleportLure).toBeCalled()
  expect(offerTeleportLure).lastCalledWith(senderId)

  expect(close).toBeCalledTimes(closeCount + 1)
  expect(close).lastCalledWith(1)

  // Decline
  const declineButton = queryByText('Decline')
  expect(declineButton).toBeTruthy()
  expect(declineButton.nodeName).toBe('BUTTON')

  fireEvent.click(declineButton)

  expect(offerTeleportLure).toBeCalledTimes(1)

  expect(close).toBeCalledTimes(closeCount + 2)
  expect(close).lastCalledWith(1)
})

it('renders a teleport lure', () => {
  const closeCount = close.mock.calls.length
  const senderId = 'abcdef'
  const lureId = 'fedcba'

  acceptTeleportLure.mockImplementation(() => () => {})
  declineTeleportLure.mockImplementation(() => () => {})
  selectNotifications.mockReturnValue([
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
  ])

  const store = configureStore()

  const { queryByText } = render(
    <Provider store={store}>
      <Notifications />
    </Provider>
  )

  expect(queryByText(`${mockedName} has offered to teleport you to their location.`))
    .toBeTruthy()

  // Accept
  const acceptButton = queryByText('Accept (not yet implemented)')
  expect(acceptButton).toBeTruthy()
  expect(acceptButton.nodeName).toBe('BUTTON')
  expect(acceptButton.disabled).toBeTruthy()

  expect(acceptTeleportLure).not.toBeCalled()
  // expect(acceptTeleportLure.mock.calls[0]).toEqual([
  //   senderId,
  //   lureId
  // ])

  expect(declineTeleportLure).not.toBeCalled()

  expect(close).toBeCalledTimes(closeCount)

  // Decline
  const declineButton = queryByText('Decline')
  expect(declineButton).toBeTruthy()
  expect(declineButton.nodeName).toBe('BUTTON')

  fireEvent.click(declineButton)

  expect(acceptTeleportLure).not.toBeCalled()

  expect(declineTeleportLure).lastCalledWith(senderId, lureId)

  expect(close).toBeCalledTimes(closeCount + 1)
  expect(close).lastCalledWith(1)
})

it('renders an inventory offer', () => {
  acceptInventoryOffer.mockImplementation(() => () => {})
  declineInventoryOffer.mockImplementation(() => () => {})

  const store = configureStore()

  const transactionId = 'transactionId'
  const fromId = '5df644f5-8b12-4caf-8e91-d7cae057e5f2'

  selectNotifications.mockReturnValue([
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
  ])

  const acceptCount = acceptInventoryOffer.mock.calls.length
  const declineCount = declineInventoryOffer.mock.calls.length
  const closeCount = close.mock.calls.length

  const { queryByText } = render(
    <Provider store={store}>
      <Notifications />
    </Provider>
  )

  expect(queryByText('Here is my offer!')).toBeTruthy()

  // Accept
  const acceptButton = queryByText('Accept')
  expect(acceptButton).toBeTruthy()
  expect(acceptButton.nodeName).toBe('BUTTON')

  fireEvent.click(acceptButton)

  expect(acceptInventoryOffer).toBeCalledTimes(acceptCount + 1)
  expect(declineInventoryOffer).toBeCalledTimes(declineCount)
  expect(acceptInventoryOffer)
    .lastCalledWith(fromId, transactionId, AssetType.ImageJPEG, false, false)

  expect(close).toBeCalledTimes(closeCount + 1)
  expect(close).lastCalledWith(4)

  // Decline
  const declineButton = queryByText('Decline')
  expect(declineButton).toBeTruthy()
  expect(declineButton.nodeName).toBe('BUTTON')

  fireEvent.click(declineButton)

  expect(acceptInventoryOffer).toBeCalledTimes(acceptCount + 1)
  expect(declineInventoryOffer).toBeCalledTimes(declineCount + 1)
  expect(declineInventoryOffer).lastCalledWith(fromId, transactionId, false, false)

  expect(close).toBeCalledTimes(closeCount + 2)
  expect(close).lastCalledWith(4)
})

it('should pass aXe', async () => {
  selectNotifications.mockReturnValue([
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
    },
    {
      id: 10,
      notificationType: NotificationTypes.FriendOnlineStateChange,
      friendId: '5df644f5-8b12-4caf-8e91-d7cae057e5f2',
      online: true,
      text: ''
    },
    {
      id: 11,
      notificationType: NotificationTypes.FriendOnlineStateChange,
      friendId: '5df644f5-8b12-4caf-8e91-d7cae057e5f2',
      online: false,
      text: ''
    }
  ])

  const store = configureStore()

  const { container } = render(
    <Provider store={store}>
      <Notifications />
    </Provider>
  )

  expect(await axe(container)).toHaveNoViolations()
})
