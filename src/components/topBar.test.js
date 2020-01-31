import { axe } from 'jest-axe'
import React from 'react'
import { shallow, mount } from 'enzyme'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'

import TopBar from './topBar'
import configureStore from '../store/configureStore'

it('renders without crashing', () => {
  shallow(<MemoryRouter>
    <TopBar
      isSignedIn={false}
      userName={''}
      isLoggedIn={false}
      avatarName={''}
      signOut={() => {}}
      logout={() => {}}
    />
  </MemoryRouter>)
})

it('should pass aXe', async () => {
  const store = configureStore()

  const rendered = mount(<Provider store={store}>
    <MemoryRouter>
      <TopBar
        isSignedIn={false}
        userName={''}
        isLoggedIn={false}
        avatarName={''}
        signOut={() => {}}
        logout={() => {}}
      />
    </MemoryRouter>
  </Provider>)

  expect(await axe(rendered.html())).toHaveNoViolations()
})
