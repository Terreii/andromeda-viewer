import { axe } from 'jest-axe'
import React from 'react'
import { shallow } from 'enzyme'

import Login from './index'

test('renders without crashing', () => {
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

  shallow(<Login
    avatars={[]}
    grids={grids}
  />)
})

test('renders with avatars', () => {
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

  shallow(<Login
    grids={grids}
    avatars={avatars}
  />)
})

test('should pass aXe', async () => {
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

  const rendered = shallow(<Login
    grids={grids}
    avatars={avatars}
  />)

  const renderedNewUser = shallow(<Login
    grids={grids}
    avatars={[]}
  />)

  expect(await axe(rendered.html())).toHaveNoViolations()

  expect(await axe(renderedNewUser.html())).toHaveNoViolations()
})
