import { axe } from 'jest-axe'
import React from 'react'
import { render } from 'reakit-test-utils'

import ChatBox from './chatBox'
import AvatarName from '../avatarName'

it('renders without crashing', () => {
  const names = {
    first: new AvatarName('Testery MacTestface')
  }

  const im = [
    {
      sessionId: '2345',
      withId: 'first',
      isIM: true,
      messages: []
    }
  ]

  const friends = [
    {
      id: 'first',
      rightsGiven: {},
      rightsHas: {}
    }
  ]

  const groups = [
    {
      id: 'abcd',
      name: 'Great group',
      insigniaID: 'dcba',
      title: 'Person',
      acceptNotices: true,
      powers: [0, 0],
      listInProfile: true,
      sessionStarted: true
    }
  ]

  const { container } = render(<ChatBox
    selfName={new AvatarName('self Resident')}
    names={names}
    IMs={im}
    friends={friends}
    groups={groups}
    localChat={[]}
    sendLocalChatMessage={() => {}}
    changeTab={() => {}}
  />)

  expect(container).toBeTruthy()
})

it('should pass aXe', async () => {
  const names = {
    first: new AvatarName('Testery MacTestface')
  }

  const im = [
    {
      name: 'first chat',
      sessionId: '2345',
      withId: 'first',
      isIM: true,
      messages: []
    }
  ]

  const friends = [
    {
      id: 'first',
      rightsGiven: {},
      rightsHas: {}
    }
  ]

  const groups = [
    {
      id: 'abcd',
      name: 'Great group',
      insigniaID: 'dcba',
      title: 'Person',
      acceptNotices: true,
      powers: [0, 0],
      listInProfile: true,
      sessionStarted: true
    }
  ]

  const { container } = render(<div>
    <ChatBox
      selfName={new AvatarName('self Resident')}
      names={names}
      IMs={im}
      friends={friends}
      groups={groups}
      localChat={[]}
      sendLocalChatMessage={() => {}}
      changeTab={() => {}}
    />
  </div>)

  expect(await axe(container)).toHaveNoViolations()
})
