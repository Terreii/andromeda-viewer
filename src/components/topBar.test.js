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
  shallow(<TopBar
    account={account}
  />)
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
  const rendered = mount(<Provider store={store}>
    <TopBar
      account={account}
    />
  </Provider>)

  expect(await axe(rendered.html())).toHaveNoViolations()
})
