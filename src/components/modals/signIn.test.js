import { axe } from 'jest-axe'
import { Provider } from 'react-redux'
import { useDialogState, DialogDisclosure } from 'reakit'
import { render, fireEvent } from 'reakit-test-utils'

import SignInPopup from './signIn'

const Container = ({ store, isSignUp }) => {
  const dialog = useDialogState()

  return (
    <Provider store={store}>
      <DialogDisclosure {...dialog}>Test</DialogDisclosure>
      <SignInPopup dialog={dialog} isSignUp={isSignUp} />
    </Provider>
  )
}

describe('signUp', () => {
  it('renders without crashing', () => {
    const store = {
      getState: () => ({}),
      dispatch: () => {},
      subscribe: () => () => {}
    }

    render(<Container isSignUp store={store} />)
  })

  it('should render different if it is signUp', () => {
    const store = {
      getState: () => ({}),
      dispatch: () => {},
      subscribe: () => () => {}
    }

    const { queryByText, queryByLabelText } = render(<Container isSignUp store={store} />)

    expect(queryByText('Sign up')).toBeTruthy()
    expect(queryByText('cancel').nodeName).toBe('BUTTON')
    expect(queryByText('sign up').nodeName).toBe('BUTTON')
    expect(queryByLabelText('Repeat password')).toBeTruthy()
  })

  it('should handle actions', async () => {
    const dispatch = jest.fn()
    const store = {
      getState: () => ({}),
      dispatch,
      subscribe: () => () => {}
    }

    const {
      queryByText,
      queryByLabelText,
      findByLabelText,
      findByText
    } = render(<Container isSignUp store={store} />)

    expect(queryByText('sign up').disabled).toBeTruthy()
    fireEvent.click(queryByText('sign up'))
    expect(dispatch.mock.calls.length).toBe(0)

    // Username input
    expect(queryByLabelText('Username / email', { exact: false })).toBeTruthy()
    fireEvent.change(queryByLabelText('Username / email', { exact: false }), {
      target: {
        value: 'testery.mactestface@example.com'
      }
    })
    expect((await findByLabelText('Username / email', { exact: false })).getAttribute('value'))
      .toBe('testery.mactestface@example.com')
    expect(queryByText('sign up').disabled).toBeTruthy()

    // Password input
    expect(queryByText("Password doesn't match!")).toBeNull()

    expect(queryByLabelText(/Password/)).toBeTruthy()
    fireEvent.change(queryByLabelText(/Password/), {
      target: {
        value: 'secretPassword'
      }
    })
    expect((await findByLabelText(/Password/)).getAttribute('value'))
      .toBe('secretPassword')
    expect(queryByText('sign up').disabled).toBeTruthy()

    // Password 2 input
    expect(queryByLabelText('Repeat password')).toBeTruthy()
    fireEvent.change(queryByLabelText('Repeat password'), {
      target: {
        value: 'secretPassword'
      }
    })
    expect((await findByLabelText('Repeat password')).getAttribute('value'))
      .toBe('secretPassword')
    expect(queryByText('sign up').disabled).toBeFalsy()

    // Mismatch
    fireEvent.change(queryByLabelText(/Password/), {
      target: {
        value: 'secretPassword2'
      }
    })
    expect(await findByText("Password doesn't match!")).toBeTruthy()
    expect(queryByText('sign up').disabled).toBeTruthy()

    fireEvent.change(queryByLabelText('Repeat password', { exact: false }), {
      target: {
        value: 'secretPassword2'
      }
    })
    expect(queryByText('sign up').disabled).toBeFalsy()

    fireEvent.click(queryByText('sign up'))
    expect(dispatch.mock.calls.length).toBe(1)
    expect(dispatch.mock.calls[0][0]).toBeInstanceOf(Function)
  })

  it('should pass aXe', async () => {
    const store = {
      getState: () => ({}),
      dispatch: () => {},
      subscribe: () => () => {}
    }

    const { container } = render(<Container isSignUp store={store} />)

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('singIn', () => {
  it('renders without crashing', () => {
    const store = {
      getState: () => ({}),
      dispatch: () => {},
      subscribe: () => () => {}
    }

    render(<Container store={store} />)
  })

  it('should render different if it is signIn', () => {
    const store = {
      getState: () => ({}),
      dispatch: () => {},
      subscribe: () => () => {}
    }

    const { queryByText, queryByLabelText } = render(<Container store={store} />)

    expect(queryByText('Sign in')).toBeTruthy()
    expect(queryByText('cancel').nodeName).toBe('BUTTON')
    expect(queryByText('sign in').nodeName).toBe('BUTTON')
    expect(queryByLabelText('Repeat password:')).toBeNull()
  })

  it('should handle actions', async () => {
    const dispatch = jest.fn()
    const store = {
      getState: () => ({}),
      dispatch,
      subscribe: () => () => {}
    }

    const {
      queryByText,
      queryByLabelText,
      findByLabelText
    } = render(<Container store={store} />)

    expect(queryByText('sign in').disabled).toBeTruthy()
    fireEvent.click(queryByText('sign in'))
    expect(dispatch.mock.calls.length).toBe(0)

    // Username input
    expect(queryByLabelText('Username / email', { exact: false })).toBeTruthy()
    fireEvent.change(queryByLabelText('Username / email', { exact: false }), {
      target: {
        value: 'testery.mactestface@example.com'
      }
    })
    expect((await findByLabelText('Username / email', { exact: false })).getAttribute('value'))
      .toBe('testery.mactestface@example.com')
    expect(queryByText('sign in').disabled).toBeTruthy()

    // Password input
    expect(queryByLabelText(/^Password/)).toBeTruthy()
    fireEvent.change(queryByLabelText(/^Password/), {
      target: {
        value: 'secretPassword'
      }
    })
    expect((await findByLabelText(/^Password/)).getAttribute('value'))
      .toBe('secretPassword')
    expect(queryByText('sign in').disabled).toBeFalsy()

    // Password 2 input
    expect(queryByLabelText(/Repeat password/)).toBeNull()

    fireEvent.click(queryByText('sign in'))
    expect(dispatch.mock.calls.length).toBe(1)
    expect(dispatch.mock.calls[0][0]).toBeInstanceOf(Function)
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
})
