import { axe } from 'jest-axe'
import { Provider } from 'react-redux'
import { render } from '@testing-library/react'

import SignIn from './signIn'
import configureStore from '../../store/configureStore'

it('renders without crashing', () => {
  const { container } = render(
    <Provider store={configureStore()}>
      <SignIn />
    </Provider>
  )

  expect(container).toBeTruthy()
})

it('on buttons click', () => {
  const { queryByText } = render(
    <Provider store={configureStore()}>
      <SignIn />
    </Provider>
  )

  const signInButton = queryByText('Sign In')
  expect(signInButton).toBeTruthy()
  expect(signInButton.nodeName).toBe('BUTTON')

  const signUpButton = queryByText('Sign Up')
  expect(signUpButton).toBeTruthy()
  expect(signUpButton.nodeName).toBe('BUTTON')
})

it('should pass aXe', async () => {
  const { container } = render(
    <Provider store={configureStore()}>
      <SignIn />
    </Provider>
  )

  expect(await axe(container)).toHaveNoViolations()
})
