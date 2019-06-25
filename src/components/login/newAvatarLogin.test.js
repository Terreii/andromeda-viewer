import { axe } from 'jest-axe'
import React from 'react'
import { shallow } from 'enzyme'

import NewAvatarLogin from './newAvatarLogin'

test('renders without crashing', () => {
  const grids = [
    {
      name: 'Second Life',
      loginURL: 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi'
    },
    {
      name: 'OS Grid',
      loginURL: 'http://login.osgrid.org/'
    }
  ]

  shallow(<NewAvatarLogin
    grids={grids}
  />)

  shallow(<NewAvatarLogin
    grids={grids}
    isSelected
  />)
})

test('not signed in login works', () => {
  const grids = [
    {
      name: 'Second Life',
      loginURL: 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi'
    },
    {
      name: 'OS Grid',
      loginURL: 'http://login.osgrid.org/'
    }
  ]

  const loginData = []

  const rendered = shallow(<NewAvatarLogin
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
    isSelected
  />)

  const nameInput = rendered.find('[type="text"]').first()
  const passwordInput = rendered.find('[type="password"]')
  const saveCheckbox = rendered.find('#saveNewAvatarButton')
  const loginButton = rendered.children().last()

  nameInput.simulate('change', {
    target: {
      value: 'Tester',
      validity: {
        valid: true
      }
    }
  })

  passwordInput.simulate('change', {
    target: {
      value: 'secret',
      validity: {
        valid: true
      }
    }
  })

  rendered.update()
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
  const grids = [
    {
      name: 'Second Life',
      loginURL: 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi'
    },
    {
      name: 'OS Grid',
      loginURL: 'http://login.osgrid.org/'
    }
  ]

  const loginData = []

  const rendered = shallow(<NewAvatarLogin
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
    isSelected
  />)

  const nameInput = rendered.find('[type="text"]').first()
  const passwordInput = rendered.find('[type="password"]')
  const saveCheckbox = rendered.find('#saveNewAvatarButton')
  const loginButton = rendered.children().last()

  nameInput.simulate('change', {
    target: {
      value: 'Tester',
      validity: {
        valid: true
      }
    }
  })

  passwordInput.simulate('change', {
    target: {
      value: 'secret',
      validity: {
        valid: true
      }
    }
  })

  rendered.update()
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

test('adding new grid', () => {
  const grids = [
    {
      name: 'Second Life',
      loginURL: 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi'
    },
    {
      name: 'OS Grid',
      loginURL: 'http://login.osgrid.org/'
    }
  ]

  const loginData = []

  const rendered = shallow(<NewAvatarLogin
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
    isSelected
  />)

  const gridSelect = rendered.find('#newAvatarGridSelection')
  const gridName = rendered.find('#newGridNameInput')
  const gridURL = rendered.find('#newGridUrlInput')

  gridSelect.simulate('change', {
    target: {
      value: '',
      validity: {
        valid: true
      }
    }
  })

  gridName.simulate('change', {
    target: {
      value: 'Alpha Grid',
      validity: {
        valid: true
      }
    }
  })

  gridURL.simulate('change', {
    target: {
      value: 'https://alpha-grid.com/login',
      validity: {
        valid: true
      }
    }
  })
  rendered.update()

  const nameInput = rendered.find('#newAvatarNameInput').first()
  const passwordInput = rendered.find('#newAvatarPasswordInput').first()
  const loginButton = rendered.children().last()

  nameInput.simulate('change', {
    target: {
      value: 'Tester',
      validity: {
        valid: true
      }
    }
  })

  passwordInput.simulate('change', {
    target: {
      value: 'secret',
      validity: {
        valid: true
      }
    }
  })

  loginButton.simulate('click')

  expect(loginData.length).toBe(1)
  expect(loginData[0]).toEqual({
    name: 'Tester',
    password: 'secret',
    grid: {
      name: 'Alpha Grid',
      url: 'https://alpha-grid.com/login'
    },
    save: true
  })
})

test('should pass aXe', async () => {
  const grids = [
    {
      name: 'Second Life',
      loginURL: 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi'
    },
    {
      name: 'OS Grid',
      loginURL: 'http://login.osgrid.org/'
    }
  ]

  const notSelected = shallow(<NewAvatarLogin
    grids={grids}
  />)

  const selected = shallow(<NewAvatarLogin
    grids={grids}
    isSelected
  />)

  expect(await axe(notSelected.html())).toHaveNoViolations()
  expect(await axe(selected.html())).toHaveNoViolations()

  // adding new grid
  selected.find('#newAvatarGridSelection').simulate('change', {
    target: {
      value: '',
      validity: {
        valid: true
      }
    }
  })

  expect(await axe(selected.html())).toHaveNoViolations()
})
