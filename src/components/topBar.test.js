import React from 'react'
import { shallow } from 'enzyme'
import Immutable from 'immutable'

import TopBar from './topBar'

test('renders without crashing', () => {
  const account = Immutable.fromJS({
    avatarName: '',
    loggedIn: false,
    viewerAccount: {
      loggedIn: false,
      username: '',
      signInPopup: ''
    }
  })
  const noMessage = shallow(<TopBar
    account={account}
  />)

  expect(noMessage).toContainReact(<span>Welcome</span>)

  const messageOfTheDay = Immutable.Map({
    text: 'Hi there! Please go to: ',
    href: 'https://example.com'
  })

  const withMessage = shallow(<TopBar
    account={account}
    messageOfTheDay={messageOfTheDay}
  />)

  expect(withMessage.find('#messageOfTheDay').text())
    .toBe('Message of the day:Hi there! Please go to: https://example.com')
})
