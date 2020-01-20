import { axe } from 'jest-axe'
import React from 'react'
import { Provider } from 'react-redux'
import { render, fireEvent } from 'reakit-test-utils'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import UnlockDialog from './unlockDialog'

import { showPasswordReset } from '../../bundles/account'
import { signOut, unlock } from '../../actions/viewerAccount'

jest.mock('../../bundles/account')
jest.mock('../../actions/viewerAccount')

const mockStore = configureMockStore([thunk])

const Container = ({ store }) => {
  return <Provider store={store}>
    <UnlockDialog />
  </Provider>
}

it('should render without crashing', () => {
  const store = {
    getState: () => ({}),
    dispatch: () => {},
    subscribe: () => () => {}
  }

  const rendered = render(<Container store={store} />)

  expect(rendered).toBeTruthy()
})

it('should unlock with return key', async () => {
  const store = mockStore()

  const oldUnlockCallCount = unlock.mock.calls.length

  const { queryByLabelText, findByLabelText, findByText } = render(<Container store={store} />)

  expect(queryByLabelText('Password:').nodeName).toBe('INPUT')

  fireEvent.submit(queryByLabelText('Password:'))
  expect(await findByText('No password was entered jet!')).toBeTruthy()

  fireEvent.change(queryByLabelText('Password:'), {
    target: {
      value: 'aPassword'
    }
  })

  unlock.mockImplementation(password => ({ type: 'unlock', password }))

  fireEvent.submit(await findByLabelText('Password:'))

  expect(unlock.mock.calls.length).toBe(oldUnlockCallCount + 1)
  expect(unlock.mock.calls[unlock.mock.calls.length - 1]).toEqual(['aPassword'])
  expect(store.getActions()).toEqual([
    { type: 'unlock', password: 'aPassword' }
  ])
})

it('should unlock with unlock button clicked', async () => {
  const store = mockStore()

  const oldUnlockCallCount = unlock.mock.calls.length

  const { queryByLabelText, queryByText, findByText } = render(<Container store={store} />)

  expect(queryByLabelText('Password:').nodeName).toBe('INPUT')
  expect(queryByText('Unlock', { selector: 'button' })).toBeTruthy()

  fireEvent.click(queryByText('Unlock', { selector: 'button' }))
  expect(await findByText('No password was entered jet!')).toBeTruthy()

  fireEvent.change(queryByLabelText('Password:'), {
    target: {
      value: 'aPassword'
    }
  })

  unlock.mockImplementation(password => ({ type: 'unlock', password }))

  fireEvent.click(await findByText('Unlock', { selector: 'button' }))

  expect(unlock.mock.calls.length).toBe(oldUnlockCallCount + 1)
  expect(unlock.mock.calls[unlock.mock.calls.length - 1]).toEqual(['aPassword'])
  expect(store.getActions()).toEqual([
    { type: 'unlock', password: 'aPassword' }
  ])
})

it('should call sign out when sign out button is clicked', async () => {
  const store = mockStore()

  signOut.mockReturnValueOnce({ type: 'signOut' })

  const { queryByText } = render(<Container store={store} />)

  const button = queryByText('Sign out')
  expect(button).toBeTruthy()
  expect(button.nodeName).toBe('BUTTON')

  fireEvent.click(button)
  expect(store.getActions()).toEqual([
    { type: 'signOut' }
  ])
})

it('should show reset crypto password if the reset password button is clicked', async () => {
  const store = mockStore()

  showPasswordReset.mockImplementationOnce((...args) => ({ type: 'show_reset', args }))

  const { queryByText } = render(<Container store={store} />)

  expect(queryByText('Reset password')).toBeTruthy()
  fireEvent.click(queryByText('Reset password'))

  expect(store.getActions()).toEqual([
    {
      type: 'show_reset',
      args: ['encryption']
    }
  ])
})

it('should pass aXe', async () => {
  const store = {
    getState: () => ({}),
    dispatch: () => {},
    subscribe: () => () => {}
  }

  const { container } = render(<Container store={store} />)

  expect(await axe(container)).toHaveNoViolations()
})
