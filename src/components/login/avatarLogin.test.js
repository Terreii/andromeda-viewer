import { axe } from 'jest-axe'
import { render, fireEvent } from '@testing-library/react'

import AvatarLogin from './avatarLogin'

it('renders without crashing', () => {
  const avatar = {
    _id: 'avatar/testery',
    name: 'Testery MacTestface',
    grid: 'Second Life'
  }

  const grid = {
    name: 'Second Life',
    loginURL: 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi'
  }

  const { container: notSelectedContainer } = render(
    <AvatarLogin
      avatar={avatar}
      grid={grid}
    />
  )

  expect(notSelectedContainer).toBeTruthy()

  const { container: selectedContainer } = render(
    <AvatarLogin
      avatar={avatar}
      grid={grid}
      isSelected
    />
  )

  expect(selectedContainer).toBeTruthy()
})

it('should call onSelect when clicked and not selected', () => {
  const avatar = {
    _id: 'avatar/testery',
    name: 'Testery MacTestface',
    grid: 'Second Life',
    avatarIdentifier: 'abcd@Second Life'
  }

  const grid = {
    name: 'Second Life',
    loginURL: 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi'
  }

  const onLogin = jest.fn()
  const onSelect = jest.fn()

  const { queryByText } = render(
    <AvatarLogin
      avatar={avatar}
      grid={grid}
      onLogin={onLogin}
      isSelected={false}
      onSelect={onSelect}
    />
  )

  expect(queryByText('Testery Mactestface')).toBeTruthy()

  const clickText = queryByText('click to login')
  expect(clickText).toBeTruthy()
  expect(clickText.parentElement).toBeTruthy()
  expect(clickText.parentElement.nodeName).toBe('BUTTON')

  fireEvent.click(clickText.parentElement)

  expect(onLogin.mock.calls).toEqual([])
  expect(onSelect.mock.calls).toEqual([
    ['abcd@Second Life']
  ])
})

it('should successfully login', async () => {
  const avatar = {
    _id: 'avatar/testery',
    name: 'Testery MacTestface',
    grid: 'Second Life'
  }

  const grid = {
    name: 'Second Life',
    loginURL: 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi'
  }

  const onLogin = jest.fn()

  const { queryByText, queryByLabelText, findByText } = render(
    <AvatarLogin
      avatar={avatar}
      grid={grid}
      onLogin={onLogin}
      isSelected
    />
  )

  // no password
  const loginButton = queryByText('Login')
  expect(loginButton).toBeTruthy()
  expect(loginButton.nodeName).toBe('BUTTON')
  expect(loginButton.disabled).toBeTruthy()

  const input = queryByLabelText('Password')
  expect(input).toBeTruthy()
  expect(input.nodeName).toBe('INPUT')

  fireEvent.change(input, {
    target: {
      value: 'aPassword'
    }
  })

  const enabledButton = await findByText('Login')
  expect(enabledButton).toBeTruthy()
  expect(enabledButton.nodeName).toBe('BUTTON')
  expect(enabledButton.disabled).toBeFalsy()

  fireEvent.submit(enabledButton)

  expect(onLogin.mock.calls).toEqual([
    [avatar, 'aPassword']
  ])

  // login again
  const enabledButton2 = await findByText('Login')
  expect(enabledButton2).toBeTruthy()
  expect(enabledButton2.nodeName).toBe('BUTTON')
  expect(enabledButton2.disabled).toBeFalsy()

  fireEvent.submit(enabledButton2)

  expect(onLogin.mock.calls.length).toBe(2)
  expect(onLogin.mock.calls[1]).toEqual([avatar, 'aPassword'])
})

it('should pass aXe', async () => {
  const avatar = {
    _id: 'avatar/testery',
    name: 'Testery MacTestface',
    grid: 'Second Life'
  }

  const grid = {
    name: 'Second Life',
    loginURL: 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi'
  }

  const { container } = render(
    <AvatarLogin
      avatar={avatar}
      grid={grid}
      onLogin={() => {}}
      isSelected
    />
  )

  expect(await axe(container)).toHaveNoViolations()
})
