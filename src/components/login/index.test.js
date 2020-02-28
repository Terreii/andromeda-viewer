import { axe } from 'jest-axe'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { render } from '@testing-library/react'

import Login from './index'
import configureStore from '../../store/configureStore'

const grids = [
  {
    name: 'Second Life',
    loginURL: 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi'
  },
  {
    name: 'Second Life Beta',
    loginURL: 'https://login.aditi.lindenlab.com/cgi-bin/login.cgi'
  },
  {
    name: 'OS Grid',
    loginURL: 'http://login.osgrid.org/'
  }
]

const avatars = [
  {
    _id: 'avatar/testery',
    name: 'Testery MacTestface',
    grid: 'Second Life'
  }
]

it('renders without crashing', () => {
  const { container } = render(<Provider store={configureStore()}>
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  </Provider>)

  expect(container).toBeTruthy()
})

it('renders with avatars', () => {
  const { container } = render(<Provider store={configureStore()}>
    <MemoryRouter>
      <Login isSignedIn />
    </MemoryRouter>
  </Provider>)

  expect(container).toBeTruthy()
})

it('should pass aXe', async () => {
  const { container: withAvatars } = render(<Provider
    store={configureStore({
      account: {
        unlocked: true,
        loggedIn: true,
        username: 'tester@test.org',
        savedAvatars: avatars,
        savedAvatarsLoaded: true,
        savedGrids: grids,
        savedGridsLoaded: true
      }
    })}
  >
    <MemoryRouter>
      <Login isSignedIn />
    </MemoryRouter>
  </Provider>)

  expect(await axe(withAvatars)).toHaveNoViolations()

  const { container: newUser } = render(<Provider store={configureStore()}>
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  </Provider>)

  expect(await axe(newUser)).toHaveNoViolations()
})
