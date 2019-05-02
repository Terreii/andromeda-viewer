import { axe } from 'jest-axe'
import React from 'react'
import { shallow, mount } from 'enzyme'

import AvatarLogin from './avatarLogin'

test('renders without crashing', () => {
  const avatar = {
    _id: 'avatar/testery',
    name: 'Testery MacTestface',
    grid: 'Second Life'
  }

  const grid = {
    name: 'Second Life',
    loginURL: 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi'
  }

  shallow(<AvatarLogin
    avatar={avatar}
    grid={grid}
  />)

  shallow(<AvatarLogin
    avatar={avatar}
    grid={grid}
    isSelected
  />)
})

test('login works', () => {
  const avatar = {
    _id: 'avatar/testery',
    name: 'Testery MacTestface',
    grid: 'Second Life'
  }

  const grid = {
    name: 'Second Life',
    loginURL: 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi'
  }

  const loginInfo = {
    count: 0,
    avatar: null,
    password: null
  }

  const rendered = mount(<AvatarLogin
    avatar={avatar}
    grid={grid}
    onLogin={(theAvatar, password) => {
      loginInfo.count += 1
      loginInfo.avatar = theAvatar
      loginInfo.password = password
    }}
    isSelected
  />)

  const input = rendered.find('input')
  const button = rendered.find('button')

  input.simulate('keyUp', {
    keyCode: 13
  })

  // no password
  expect(button.prop('disabled')).toBeTruthy()
  expect(loginInfo.count).toBe(0)

  input.simulate('change', {
    target: {
      value: 'aPassword'
    }
  })

  button.simulate('click')

  expect(loginInfo.count).toBe(1)
  expect(loginInfo.avatar).toBe(avatar)
  expect(loginInfo.password).toBe('aPassword')

  loginInfo.avatar = null
  loginInfo.password = null

  input.simulate('keyUp', {
    keyCode: 13
  })

  expect(loginInfo.count).toBe(2)
  expect(loginInfo.avatar).toBe(avatar)
  expect(loginInfo.password).toBe('aPassword')
})

test('should pass aXe', async () => {
  const avatar = {
    _id: 'avatar/testery',
    name: 'Testery MacTestface',
    grid: 'Second Life'
  }

  const grid = {
    name: 'Second Life',
    loginURL: 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi'
  }

  const loginInfo = {
    count: 0,
    avatar: null,
    password: null
  }

  const rendered = mount(<AvatarLogin
    avatar={avatar}
    grid={grid}
    onLogin={(theAvatar, password) => {
      loginInfo.count += 1
      loginInfo.avatar = theAvatar
      loginInfo.password = password
    }}
    isSelected
  />)

  expect(await axe(rendered.html())).toHaveNoViolations()
})
