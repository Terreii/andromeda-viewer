import { axe } from 'jest-axe'
import React from 'react'
import { shallow, mount } from 'enzyme'
import Immutable from 'immutable'
import { Provider } from 'react-redux'

import TopBar from './topBar'
import configureStore from '../store/configureStore'

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

test('should pass aXe', async () => {
  const store = configureStore()

  const account = Immutable.fromJS({
    avatarName: '',
    loggedIn: false,
    viewerAccount: {
      loggedIn: false,
      username: '',
      signInPopup: ''
    }
  })
  const noMessage = mount(<Provider store={store}>
    <TopBar
      account={account}
    />
  </Provider>)

  expect(await axe(noMessage.html())).toHaveNoViolations()

  const messageOfTheDay = Immutable.Map({
    text: 'Hi there! Please go to: ',
    href: 'https://example.com'
  })

  const withMessage = mount(<Provider store={store}>
    <TopBar
      account={account}
      messageOfTheDay={messageOfTheDay}
    />
  </Provider>)

  expect(await axe(withMessage.html())).toHaveNoViolations()
})
