import React from 'react'
import { shallow } from 'enzyme'
import Immutable from 'immutable'

import Login from './index'

test('renders without crashing', () => {
  const avatars = Immutable.List()

  const grids = Immutable.fromJS([
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
  ])

  shallow(<Login
    avatars={avatars}
    grids={grids}
  />)
})

test('renders with avatars', () => {
  const grids = Immutable.fromJS([
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
  ])

  const avatars = Immutable.fromJS([
    {
      _id: 'avatar/testery',
      name: 'Testery MacTestface',
      grid: 'Second Life'
    }
  ])

  shallow(<Login
    grids={grids}
    avatars={avatars}
  />)
})
