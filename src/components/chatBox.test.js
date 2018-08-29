import React from 'react'
import { shallow } from 'enzyme'
import Immutable from 'immutable'

import ChatBox from './chatBox'
import AvatarName from '../avatarName'

test('renders without crashing', () => {
  const names = Immutable.fromJS({
    names: {
      first: new AvatarName('Testery MacTestface')
    }
  })

  const im = Immutable.fromJS({
    first: {
      withId: 'first',
      isIM: true,
      messages: []
    }
  })

  const friends = Immutable.fromJS([
    {
      id: 'first',
      rightsGiven: {},
      rightsHas: {}
    }
  ])

  const localChat = Immutable.fromJS([])

  shallow(<ChatBox
    names={names}
    IMs={im}
    friends={friends}
    localChat={localChat}
    sendLocalChatMessage={() => {}}
  />)
})
