import { axe } from 'jest-axe'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import NewAvatarLogin from './newAvatarLogin'

it('renders without crashing', () => {
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

  const { container: notSelectedContainer } = render(
    <NewAvatarLogin
      grids={grids}
    />
  )

  expect(notSelectedContainer).toBeTruthy()

  const { container: selectedContainer } = render(
    <NewAvatarLogin
      grids={grids}
      isSelected
    />
  )

  expect(selectedContainer).toBeTruthy()
})

it('should login while not signed', async () => {
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

  const onLogin = jest.fn()

  const { queryByLabelText, queryByText, findByText, findByLabelText } = render(
    <NewAvatarLogin
      grids={grids}
      isSignedIn={false}
      onLogin={onLogin}
      isLoggingIn={false}
      isSelected
    />
  )

  const nameInput = queryByLabelText('Avatar')
  expect(nameInput).toBeTruthy()
  expect(nameInput.nodeName).toBe('INPUT')
  expect(nameInput.required).toBeTruthy()

  const passwordInput = queryByLabelText('Password')
  expect(passwordInput).toBeTruthy()
  expect(passwordInput.nodeName).toBe('INPUT')
  expect(passwordInput.type).toBe('password')

  const saveCheckbox = queryByLabelText('Save / Add')
  expect(saveCheckbox).toBeTruthy()
  expect(saveCheckbox.nodeName).toBe('INPUT')
  expect(saveCheckbox.type).toBe('checkbox')
  expect(saveCheckbox.disabled).toBeTruthy()

  const loginButton = queryByText('Login')
  expect(loginButton).toBeTruthy()
  expect(loginButton.nodeName).toBe('BUTTON')
  expect(loginButton.disabled).toBeTruthy()

  fireEvent.change(nameInput, {
    target: {
      value: 'Tester'
    }
  })

  expect((await findByText('Login')).disabled).toBeTruthy()
  expect(queryByLabelText('Avatar').validity.valid).toBeTruthy()

  fireEvent.change(passwordInput, {
    target: {
      value: 'secret'
    }
  })

  const activeLoginButton = await findByText('Login')
  expect(activeLoginButton.disabled).toBeFalsy()
  expect(queryByLabelText('Password').validity.valid).toBeTruthy()

  fireEvent.submit(activeLoginButton)

  expect(onLogin.mock.calls).toEqual([
    ['Tester', 'secret', 'Second Life', false]
  ])

  fireEvent.submit(await findByLabelText('Avatar'))
  expect(onLogin.mock.calls[1]).toEqual(['Tester', 'secret', 'Second Life', false])

  fireEvent.submit(await findByLabelText('Password'))
  expect(onLogin.mock.calls[2]).toEqual(['Tester', 'secret', 'Second Life', false])
})

it('signed in login works', async () => {
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

  const onLogin = jest.fn()

  const { queryByLabelText, queryByText, findByText, findByLabelText } = render(
    <NewAvatarLogin
      grids={grids}
      isSignedIn
      onLogin={onLogin}
      isLoggingIn={false}
      isSelected
    />
  )

  const nameInput = queryByLabelText('Avatar')
  expect(nameInput).toBeTruthy()
  expect(nameInput.nodeName).toBe('INPUT')
  expect(nameInput.required).toBeTruthy()

  const passwordInput = queryByLabelText('Password')
  expect(passwordInput).toBeTruthy()
  expect(passwordInput.nodeName).toBe('INPUT')
  expect(passwordInput.type).toBe('password')

  const saveCheckbox = queryByLabelText('Save / Add')
  expect(saveCheckbox).toBeTruthy()
  expect(saveCheckbox.nodeName).toBe('INPUT')
  expect(saveCheckbox.type).toBe('checkbox')
  expect(saveCheckbox.disabled).toBeFalsy()

  const loginButton = queryByText('Login')
  expect(loginButton).toBeTruthy()
  expect(loginButton.nodeName).toBe('BUTTON')
  expect(loginButton.disabled).toBeTruthy()

  fireEvent.change(nameInput, {
    target: {
      value: 'Tester'
    }
  })

  expect((await findByText('Login')).disabled).toBeTruthy()
  expect(queryByLabelText('Avatar').validity.valid).toBeTruthy()

  fireEvent.change(passwordInput, {
    target: {
      value: 'secret'
    }
  })

  const activeLoginButton = await findByText('Login')
  expect(activeLoginButton.disabled).toBeFalsy()
  expect(queryByLabelText('Password').validity.valid).toBeTruthy()

  fireEvent.submit(activeLoginButton)

  expect(onLogin.mock.calls).toEqual([
    ['Tester', 'secret', 'Second Life', true]
  ])

  fireEvent.submit(await findByLabelText('Avatar'))
  expect(onLogin.mock.calls[1]).toEqual(['Tester', 'secret', 'Second Life', true])

  fireEvent.submit(await findByLabelText('Password'))
  expect(onLogin.mock.calls[2]).toEqual(['Tester', 'secret', 'Second Life', true])

  fireEvent.click(await findByLabelText('Save / Add'))
  expect((await findByLabelText('Save / Add')).checked).toBeFalsy()
  fireEvent.submit(activeLoginButton)
  expect(onLogin.mock.calls[3]).toEqual(['Tester', 'secret', 'Second Life', false])
})

it('should add a new grid', async () => {
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

  const onLogin = jest.fn()

  const { queryByLabelText, findByText, findByLabelText } = render(
    <NewAvatarLogin
      grids={grids}
      isSignedIn
      onLogin={onLogin}
      isLoggingIn={false}
      isSelected
    />
  )

  const gridSelect = queryByLabelText('Grid')
  expect(gridSelect).toBeTruthy()
  expect(gridSelect.nodeName).toBe('SELECT')
  expect(gridSelect.value).toBe('Second Life')

  expect(queryByLabelText('Name')).toBeNull()
  expect(queryByLabelText('URL')).toBeNull()
  expect(queryByLabelText('Grid uses LLSD login')).toBeNull()

  fireEvent.change(gridSelect, {
    target: {
      value: ''
    }
  })

  const gridName = await findByLabelText('Name')
  expect(gridName).toBeTruthy()
  expect(gridName.nodeName).toBe('INPUT')
  expect(gridName.type).toBe('text')

  const gridURL = queryByLabelText('URL')
  expect(gridURL).toBeTruthy()
  expect(gridURL.nodeName).toBe('INPUT')
  expect(gridURL.type).toBe('url')

  const gridIsLLSD = queryByLabelText('Grid uses LLSD login')
  expect(gridIsLLSD).toBeTruthy()
  expect(gridIsLLSD.nodeName).toBe('INPUT')
  expect(gridIsLLSD.type).toBe('checkbox')
  expect(gridIsLLSD.checked).toBeTruthy()

  fireEvent.change(gridName, {
    target: {
      value: 'Alpha Grid'
    }
  })

  fireEvent.change(await findByLabelText('URL'), {
    target: {
      value: 'https://alpha-grid.com/login'
    }
  })

  fireEvent.change(queryByLabelText('Avatar'), {
    target: {
      value: 'Tester'
    }
  })

  fireEvent.change(await findByLabelText('Password'), {
    target: {
      value: 'secret'
    }
  })

  fireEvent.submit(await findByText('Login'))

  expect(onLogin.mock.calls).toEqual([
    [
      'Tester',
      'secret',
      {
        name: 'Alpha Grid',
        loginUrl: 'https://alpha-grid.com/login',
        isLoginLLSD: true
      },
      true
    ]
  ])

  // if grid is llsd is false.
  fireEvent.click(await findByLabelText('Grid uses LLSD login'))
  expect((await findByLabelText('Grid uses LLSD login')).checked).toBeFalsy()

  fireEvent.submit(await findByText('Login'))

  expect(onLogin.mock.calls[1]).toEqual([
    'Tester',
    'secret',
    {
      name: 'Alpha Grid',
      loginUrl: 'https://alpha-grid.com/login',
      isLoginLLSD: false
    },
    true
  ])
})

it('should pass aXe', async () => {
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

  const { container: notSelectedContainer } = render(
    <NewAvatarLogin
      grids={grids}
    />
  )

  expect(await axe(notSelectedContainer)).toHaveNoViolations()

  const { container: selectedContainer, queryByLabelText, findByLabelText } = render(
    <NewAvatarLogin
      grids={grids}
      isSelected
    />
  )

  expect(await axe(selectedContainer)).toHaveNoViolations()

  // adding new grid
  fireEvent.change(queryByLabelText('Grid'), {
    target: {
      value: ''
    }
  })

  await findByLabelText('Grid')

  expect(await axe(selectedContainer)).toHaveNoViolations()
})
