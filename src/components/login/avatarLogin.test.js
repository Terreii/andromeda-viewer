import React from 'react'
import { shallow, mount } from 'enzyme'
import { Map } from 'immutable'

import AvatarLogin from './avatarLogin'

test('renders without crashing', () => {
  const avatar = Map({
    _id: 'avatar/testery',
    name: 'Testery MacTestface',
    grid: 'Second Life'
  })

  const grid = Map({
    name: 'Second Life',
    loginURL: 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi'
  })

  shallow(<AvatarLogin
    avatar={avatar}
    grid={grid}
  />)
})

test('login works', () => {
  const avatar = Map({
    _id: 'avatar/testery',
    name: 'Testery MacTestface',
    grid: 'Second Life'
  })

  const grid = Map({
    name: 'Second Life',
    loginURL: 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi'
  })

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
  />)

  const button = rendered.find('button')

  button.simulate('click')

  expect(loginInfo.count).toBe(1)
  expect(loginInfo.avatar).toBe(avatar)
  expect(loginInfo.password).toBe('') // input value sadly can't be changed ...

  loginInfo.avatar = null
  loginInfo.password = null

  const input = rendered.find('input')
  input.simulate('keyUp', {
    keyCode: 13,
    DOM_VK_RETURN: 13
  })

  expect(loginInfo.count).toBe(2)
  expect(loginInfo.avatar).toBe(avatar)
  expect(loginInfo.password).toBe('')
})
