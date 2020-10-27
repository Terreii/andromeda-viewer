import { axe } from 'jest-axe'
import { Provider } from 'react-redux'
import { useDialogState, DialogDisclosure } from 'reakit'
import { render, fireEvent } from 'reakit-test-utils'
import configureMockStore from 'redux-mock-store'

import SignOutDialog from './signOut'

const mockStore = configureMockStore()

const Container = ({ store, onSignOut }) => {
  const dialog = useDialogState()

  return (
    <Provider store={store}>
      <DialogDisclosure {...dialog}>Toggle show</DialogDisclosure>
      <SignOutDialog dialog={dialog} onSignOut={onSignOut} />
    </Provider>
  )
}

it('should render without crashing', () => {
  const { container } = render(<Container store={mockStore()} onSignOut={() => {}} />)

  expect(container).toBeTruthy()
})

it('should render title and buttons', () => {
  const { queryByText } = render(<Container store={mockStore()} onSignOut={() => {}} />)

  expect(queryByText('Sign Out?')).toBeTruthy()
  expect(queryByText('Sign Out?').nodeName).toBe('H4')

  expect(queryByText('cancel')).toBeTruthy()
  expect(queryByText('cancel').nodeName).toBe('BUTTON')

  expect(queryByText('sign out')).toBeTruthy()
  expect(queryByText('sign out').nodeName).toBe('BUTTON')
})

it('should fire events', () => {
  const onSignOut = jest.fn()

  const { queryByText } = render(<Container store={mockStore()} onSignOut={onSignOut} />)

  const button = queryByText('sign out')
  expect(button).toBeTruthy()
  expect(button.nodeName).toBe('BUTTON')

  fireEvent.click(button)

  expect(onSignOut.mock.calls.length).toBe(1)
})

it('should pass aXe', async () => {
  const { container } = render(<Container store={mockStore()} onSignOut={() => {}} />)

  expect(await axe(container)).toHaveNoViolations()
})
