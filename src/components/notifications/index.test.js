import { axe } from 'jest-axe'
import React from 'react'
import { mount } from 'enzyme'

import { NotificationTypes } from '../../types/chat'
import { AssetType } from '../../types/inventory'

import Notifications from './index'

global.Array.prototype.flatMap = jest.fn(function (fn) {
  return [].concat(this.map(fn))
})

test('renders without crashing', () => {
  const allNotifications = [
    {
      id: 0,
      notificationType: NotificationTypes.TextOnly,
      text: 'Test',
      fromName: 'Tester'
    }
  ]

  mount(<Notifications
    notifications={allNotifications}
  />)
})

test('renders a basic MessageBox', () => {
  const allNotifications = [
    {
      id: 4,
      notificationType: NotificationTypes.TextOnly,
      fromName: 'Tester',
      text: 'Test'
    }
  ]

  const onClose = jest.fn()

  const rendered = mount(<Notifications
    notifications={allNotifications}
    onClose={onClose}
  />)

  expect(rendered).toContainReact(<h4>Tester</h4>)
  expect(rendered.find('p').text()).toBe('Test')

  const buttons = rendered.find('button')
  expect(buttons.length).toBe(1)
  buttons.at(0).simulate('click')

  expect(onClose.mock.calls.length).toBe(1)
  expect(onClose.mock.calls[0][0]).toBe(4)
})

test('renders a system MessageBox', () => {
  const allNotifications = [
    {
      id: 4,
      notificationType: NotificationTypes.System,
      text: 'Test'
    }
  ]

  const onClose = jest.fn()

  const rendered = mount(<Notifications
    notifications={allNotifications}
    onClose={onClose}
  />)

  expect(rendered).toContainReact(<h4>System Notification</h4>)
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
  const allNotifications = [
    {
      id: 4,
      notificationType: NotificationTypes.FriendshipOffer,
      text: 'I would like to by your friend!',
      fromId,
      fromAgentName: 'Testy Tester',
      sessionId
    }
  ]

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

test('renders a group invitation', () => {
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

  const onAccept = jest.fn()
  const onDecline = jest.fn()
  const onClose = jest.fn()

  const rendered = mount(<Notifications
    notifications={allNotifications}
    acceptGroupInvite={onAccept}
    declineGroupInvite={onDecline}
    onClose={onClose}
  />)

  expect(rendered.find('p').text()).toBe('Join my group!')

  const buttons = rendered.find('button')
  expect(buttons.length).toBe(2)

  // Accept
  buttons.at(0).simulate('click')

  expect(onAccept.mock.calls.length).toBe(1)
  expect(onDecline.mock.calls.length).toBe(0)
  expect(onAccept.mock.calls[0]).toEqual([
    transactionId,
    groupId
  ])

  expect(onClose.mock.calls.length).toBe(1)
  expect(onClose.mock.calls[0][0]).toBe(4)

  // Decline
  buttons.at(1).simulate('click')

  expect(onAccept.mock.calls.length).toBe(1)
  expect(onDecline.mock.calls.length).toBe(1)
  expect(onDecline.mock.calls[0]).toEqual([
    transactionId,
    groupId
  ])

  expect(onClose.mock.calls.length).toBe(2)
  expect(onClose.mock.calls[1][0]).toBe(4)
})

test('renders a group notice', () => {
  const transactionId = 'transactionId'
  const groupId = 'group id'
  const senderId = 'dcba'

  const dataWithItem = [
    {
      id: 4,
      notificationType: NotificationTypes.GroupNotice,
      title: 'New stuff',
      text: 'Changes in this group:\n- a\n- b',
      groupId,
      senderName: 'Tester',
      senderId,
      time: Date.now(),
      item: {
        name: 'itemName',
        type: AssetType.ImageJPEG,
        transactionId
      }
    }
  ]

  const dataWithoutItem = [
    {
      id: 4,
      notificationType: NotificationTypes.GroupNotice,
      title: 'New stuff',
      text: 'Changes in this group:\n- a\n- b',
      groupId,
      senderName: 'Tester',
      senderId,
      time: Date.now(),
      item: null
    }
  ]

  const onAccept = jest.fn()
  const onDecline = jest.fn()
  const onClose = jest.fn()

  const withItemRendered = mount(<Notifications
    notifications={dataWithItem}
    acceptGroupNoticeItem={onAccept}
    declineGroupNoticeItem={onDecline}
    onClose={onClose}
  />)

  expect(withItemRendered.find('h4').text()).toBe('New stuff')
  expect(withItemRendered.find('p').text()).toBe('Changes in this group:- a- b')

  const buttons = withItemRendered.find('button')
  expect(buttons.length).toBe(2)

  // Accept
  buttons.at(0).simulate('click')

  expect(onAccept.mock.calls.length).toBe(1)
  expect(onDecline.mock.calls.length).toBe(0)
  expect(onAccept.mock.calls[0]).toEqual([
    senderId,
    transactionId,
    AssetType.ImageJPEG
  ])

  expect(onClose.mock.calls.length).toBe(1)
  expect(onClose.mock.calls[0][0]).toBe(4)

  // Decline
  buttons.at(1).simulate('click')

  expect(onAccept.mock.calls.length).toBe(1)
  expect(onDecline.mock.calls.length).toBe(1)
  expect(onDecline.mock.calls[0]).toEqual([
    senderId,
    transactionId
  ])

  expect(onClose.mock.calls.length).toBe(2)
  expect(onClose.mock.calls[1][0]).toBe(4)

  const withoutItemRendered = mount(<Notifications
    notifications={dataWithoutItem}
    acceptGroupNoticeItem={onAccept}
    declineGroupNoticeItem={onDecline}
    onClose={onClose}
  />)

  const okButtons = withoutItemRendered.find('button')
  expect(okButtons.length).toBe(1)

  okButtons.at(0).simulate('click')

  expect(onAccept.mock.calls.length).toBe(1)
  expect(onDecline.mock.calls.length).toBe(1)
  expect(onClose.mock.calls.length).toBe(3)
  expect(onClose.mock.calls[2][0]).toBe(4)
})

test('renders an open URL', () => {
  const href = 'https://secondlife.com/support/downloads/'
  const onClose = jest.fn()

  const rendered = mount(<Notifications
    notifications={[
      {
        id: 1,
        notificationType: NotificationTypes.LoadURL,
        text: 'Please go to this URL',
        url: href,
        fromId: 'Abcd',
        fromAgentName: 'Tester'
      }
    ]}
    onClose={onClose}
  />)

  expect(rendered).toContainReact(<a href={href} target='_blank' rel='noopener noreferrer'>
    {href}
  </a>)

  const button = rendered.find('button')
  expect(button.length).toBe(1)

  button.at(0).simulate('click')

  expect(onClose.mock.calls.length).toBe(1)
  expect(onClose.mock.calls[0][0]).toBe(1)
})

test('renders a request teleport lure', () => {
  const agentName = 'Tester'
  const senderId = '1234567890'
  const onAccept = jest.fn()
  const onClose = jest.fn()

  const rendered = mount(<Notifications
    notifications={[
      {
        id: 1,
        notificationType: NotificationTypes.RequestTeleportLure,
        text: 'Please teleport me to you.',
        fromId: senderId,
        fromAgentName: agentName
      }
    ]}
    offerTeleport={onAccept}
    onClose={onClose}
  />)

  expect(rendered).toIncludeText(agentName + ' is requesting to be teleported to your location.')

  const buttons = rendered.find('button')
  expect(buttons.length).toBe(2)

  // Accept
  buttons.at(0).simulate('click')

  expect(onAccept.mock.calls.length).toBe(1)
  expect(onAccept.mock.calls[0]).toEqual([
    senderId
  ])

  expect(onClose.mock.calls.length).toBe(1)
  expect(onClose.mock.calls[0][0]).toBe(1)

  // Decline
  buttons.at(1).simulate('click')

  expect(onAccept.mock.calls.length).toBe(1)

  expect(onClose.mock.calls.length).toBe(2)
  expect(onClose.mock.calls[1][0]).toBe(1)
})

test('should pass aXe', async () => {
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
      fromAgentName: 'Testy Tester',
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
      senderId: 'dcba',
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
      senderId: 'dcba',
      time: Date.now(),
      item: null
    },
    {
      id: 6,
      notificationType: NotificationTypes.LoadURL,
      text: 'Please go to this URL',
      url: 'https://secondlife.com/support/downloads/',
      fromId: 'Abcd',
      fromAgentName: 'Tester'
    },
    {
      id: 7,
      notificationType: NotificationTypes.RequestTeleportLure,
      text: 'Please teleport me to you.',
      fromId: 'abcd',
      fromAgentName: 'Tester'
    }
  ]

  const rendered = mount(<Notifications
    notifications={allNotifications}
  />)

  expect(await axe(rendered.html())).toHaveNoViolations()
})
