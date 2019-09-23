import { axe } from 'jest-axe'
import React from 'react'
import { shallow, mount } from 'enzyme'

import ChatBox from './chatBox'
import AvatarName from '../avatarName'

test('renders without crashing', () => {
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

  shallow(<ChatBox
    selfName={new AvatarName('self Resident')}
    names={names}
    IMs={im}
    friends={friends}
    localChat={[]}
    sendLocalChatMessage={() => {}}
  />)
})

test('should pass aXe', async () => {
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

  const rendered = mount(<div>
    <ChatBox
      selfName={new AvatarName('self Resident')}
      names={names}
      IMs={im}
      friends={friends}
      localChat={[]}
      sendLocalChatMessage={() => {}}
    />
  </div>)

  expect(await axe(rendered.html())).toHaveNoViolations()
})
