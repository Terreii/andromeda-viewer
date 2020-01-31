import { axe } from 'jest-axe'
import React from 'react'
import { Provider } from 'react-redux'
import { useDialogState, DialogDisclosure } from 'reakit'
import { render, fireEvent } from 'reakit-test-utils'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import ResetPasswordDialog from './resetPasswordDialog'

import { signOut, changeEncryptionPassword } from '../../actions/viewerAccount'

jest.mock('../../actions/viewerAccount')

const mockStore = configureMockStore([thunk])

const Container = ({ store, type }) => {
  const dialog = useDialogState()

  return <Provider store={store}>
    <DialogDisclosure {...dialog}>toggle show</DialogDisclosure>
    <ResetPasswordDialog dialog={dialog} type={type} />
  </Provider>
}

it('should render without crashing', () => {
  const { container } = render(<Container store={mockStore()} type='encryption' />)

  expect(container).toBeTruthy()
})

it('should call changeEncryptionPassword only if the input is valid', async () => {
  const store = mockStore()

  changeEncryptionPassword.mockImplementationOnce((...args) => dispatch => {
    dispatch({ type: 'changeCryptoPassword', args })
    return Promise.resolve()
  })

  const resetKeyLabel = 'Reset-key:'
  const password1Label = 'New encryption Password'
  const password2Label = 'Repeat new password'
  const changePasswordText = 'change encryption password'

  const { queryByLabelText, queryByText, findByLabelText, findByText } = render(<Container
    store={store}
    type='encryption'
  />)

  expect(queryByText('Reset password')).toBeTruthy()
  expect(queryByText('Reset password').nodeName).toBe('H4')

  expect(queryByLabelText(resetKeyLabel)).toBeTruthy()
  expect(queryByLabelText(resetKeyLabel).nodeName).toBe('INPUT')

  expect(queryByLabelText(password1Label)).toBeTruthy()
  expect(queryByLabelText(password1Label).nodeName).toBe('INPUT')
  expect(queryByLabelText(password1Label).type).toBe('password')

  expect(queryByLabelText(password2Label)).toBeTruthy()
  expect(queryByLabelText(password2Label).nodeName).toBe('INPUT')
  expect(queryByLabelText(password2Label).type).toBe('password')

  const cancelButton = queryByText('cancel')
  expect(cancelButton).toBeTruthy()
  expect(cancelButton.nodeName).toBe('BUTTON')

  const signOutButton = queryByText('sign out')
  expect(signOutButton).toBeTruthy()
  expect(signOutButton.nodeName).toBe('BUTTON')

  const changePwButton = queryByText(changePasswordText)
  expect(changePwButton).toBeTruthy()
  expect(changePwButton.nodeName).toBe('BUTTON')
  expect(changePwButton.disabled).toBeTruthy()

  const updateInputs = async (resetKeyValue, password1Value, password2Value) => {
    fireEvent.change(await findByLabelText(resetKeyLabel), {
      target: {
        value: resetKeyValue
      }
    })
    fireEvent.change(await findByLabelText(password1Label), {
      target: {
        value: password1Value
      }
    })
    fireEvent.change(await findByLabelText(password2Label), {
      target: {
        value: password2Value
      }
    })
  }

  // only reset key, no new password
  await updateInputs('2309ab6d30b8f201cd20fa9edead0b20', '', '')
  expect((await findByText(changePasswordText)).disabled).toBeTruthy()

  // only new password
  await updateInputs('', 'password', 'password')
  expect((await findByText(changePasswordText)).disabled).toBeTruthy()

  // not matching passwords
  await updateInputs('2309ab6d30b8f201cd20fa9edead0b20', 'password', 'passwo')
  expect((await findByText(changePasswordText)).disabled).toBeTruthy()
  expect(queryByText("Password doesn't match!")).toBeTruthy()

  await updateInputs('2309ab6d30b8f201cd20fa9edead0b20', 'passwo', 'password')
  expect((await findByText(changePasswordText)).disabled).toBeTruthy()
  expect(queryByText("Password doesn't match!")).toBeTruthy()

  // not valid reset-key
  // to short
  await updateInputs('2309ab6d30b8f201cd20fa9edead0b', 'password', 'password')
  expect((await findByText(changePasswordText)).disabled).toBeTruthy()
  // to long
  await updateInputs('2309ab6d30b8f201cd20fa9edead0b20a', 'password', 'password')
  expect((await findByText(changePasswordText)).disabled).toBeTruthy()

  // everything is ok
  await updateInputs('2309ab6d30b8f201cd20fa9edead0b20', 'password', 'password')
  expect((await findByText(changePasswordText)).disabled).toBeFalsy()

  fireEvent.click(queryByText(changePasswordText))
  expect((await findByText(changePasswordText)).disabled).toBeTruthy()
  expect(store.getActions()).toEqual([
    {
      type: 'changeCryptoPassword',
      args: ['2309ab6d30b8f201cd20fa9edead0b20', 'password']
    }
  ])
})

it('should call signOut', () => {
  const store = mockStore()

  signOut.mockReturnValueOnce({ type: 'signOut' })

  const { queryByText } = render(<Container
    store={store}
    type='encryption'
  />)

  fireEvent.click(queryByText('sign out'))
  expect(store.getActions()).toEqual([
    { type: 'signOut' }
  ])
})

it('should pass aXe', async () => {
  const { container } = render(<Container store={mockStore()} type='encryption' />)

  expect(await axe(container)).toHaveNoViolations()
})
