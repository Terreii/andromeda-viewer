import React from 'react'
import { shallow, mount } from 'enzyme'
import { fromJS } from 'immutable'

import NewAvatarLogin from './newAvatarLogin'

test('renders without crashing', () => {
  const grids = fromJS([
    {
      name: 'Second Life',
      loginURL: 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi'
    },
    {
      name: 'OS Grid',
      loginURL: 'http://login.osgrid.org/'
    }
  ])

  shallow(<NewAvatarLogin
    grids={grids}
  />)
})

test('not signed in login works', () => {
  const grids = fromJS([
    {
      name: 'Second Life',
      loginURL: 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi'
    },
    {
      name: 'OS Grid',
      loginURL: 'http://login.osgrid.org/'
    }
  ])

  const loginData = []

  const rendered = mount(<NewAvatarLogin
    grids={grids}
    isSignedIn={false}
    onLogin={(name, password, grid, save) => {
      loginData.push({
        name,
        password,
        grid,
        save
      })
    }}
    isLoggingIn={false}
  />)

  const nameInput = rendered.find('input[type="text"]')
  const passwordInput = rendered.find('input[type="password"]')
  const saveCheckbox = rendered.find('#saveNewAvatarButton')
  const loginButton = rendered.find('button')

  nameInput.simulate('change', {
    target: {
      value: 'Tester'
    }
  })

  passwordInput.simulate('change', {
    target: {
      value: 'secret'
    }
  })

  loginButton.simulate('click')

  expect(loginData.length).toBe(1)
  expect(loginData[0]).toEqual({
    name: 'Tester',
    password: 'secret',
    grid: 'Second Life',
    save: false
  })

  expect(saveCheckbox.prop('disabled')).toBe(true)
  expect(saveCheckbox.prop('checked')).toBe(false)

  nameInput.simulate('keyUp', {
    keyCode: 13
  })

  passwordInput.simulate('keyUp', {
    keyCode: 13
  })

  expect(loginData.length).toBe(3)
  expect(loginData[1]).toEqual({
    name: 'Tester',
    password: 'secret',
    grid: 'Second Life',
    save: false
  })
  expect(loginData[2]).toEqual({
    name: 'Tester',
    password: 'secret',
    grid: 'Second Life',
    save: false
  })
})

test('signed in login works', () => {
  const grids = fromJS([
    {
      name: 'Second Life',
      loginURL: 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi'
    },
    {
      name: 'OS Grid',
      loginURL: 'http://login.osgrid.org/'
    }
  ])

  const loginData = []

  const rendered = mount(<NewAvatarLogin
    grids={grids}
    isSignedIn
    onLogin={(name, password, grid, save) => {
      loginData.push({
        name,
        password,
        grid,
        save
      })
    }}
    isLoggingIn={false}
  />)

  const nameInput = rendered.find('input[type="text"]')
  const passwordInput = rendered.find('input[type="password"]')
  const saveCheckbox = rendered.find('#saveNewAvatarButton')
  const loginButton = rendered.find('button')

  nameInput.simulate('change', {
    target: {
      value: 'Tester'
    }
  })

  passwordInput.simulate('change', {
    target: {
      value: 'secret'
    }
  })

  loginButton.simulate('click')

  expect(loginData.length).toBe(1)
  expect(loginData[0]).toEqual({
    name: 'Tester',
    password: 'secret',
    grid: 'Second Life',
    save: true
  })

  expect(saveCheckbox.prop('disabled')).toBe(false)
  saveCheckbox.simulate('change', {
    target: {
      checked: false
    }
  })

  nameInput.simulate('keyUp', {
    keyCode: 13
  })

  passwordInput.simulate('keyUp', {
    keyCode: 13
  })

  expect(loginData.length).toBe(3)
  expect(loginData[1]).toEqual({
    name: 'Tester',
    password: 'secret',
    grid: 'Second Life',
    save: false
  })
  expect(loginData[2]).toEqual({
    name: 'Tester',
    password: 'secret',
    grid: 'Second Life',
    save: false
  })
})
