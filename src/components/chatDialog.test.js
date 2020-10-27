import { axe } from 'jest-axe'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { render, fireEvent } from '@testing-library/react'

import ChatDialog from './chatDialog'
import AvatarName from '../avatarName'

function configureStore (state = {}) {
  const store = configureMockStore([thunk])
  return store(state)
}

it('renders without crashing', () => {
  const store = configureStore({
    IMs: {
      chats: {
        2345: {
          sessionId: '2345',
          withId: 'first',
          isIM: true,
          messages: []
        }
      },
      messages: {
        2345: []
      }
    },
    localChat: [],
    names: {
      names: {
        first: new AvatarName('Testery MacTestface')
      }
    }
  })

  const { container } = render(
    <Provider store={store}>
      <ChatDialog isIM={false} sendTo={() => {}} />
    </Provider>
  )

  expect(container).toBeTruthy()
})

describe('local chat', () => {
  it('renders', async () => {
    const store = configureStore({
      IMs: {
        messages: {
          abc: [
            {
              _id: 'something/def/20202020',
              fromId: 'first',
              fromName: 'Testery MacTestface',
              message: 'Hello world!',
              time: 10,
              didSave: true,
              offline: false
            }
          ]
        }
      },
      localChat: [
        {
          _id: 'something/def/20202020',
          fromId: 'second',
          fromName: 'Happy User',
          message: 'Look there!',
          time: 10,
          didSave: true,
          offline: false
        }
      ],
      names: {
        names: {
          first: new AvatarName('Testery MacTestface'),
          second: new AvatarName('Happy User')
        }
      }
    })

    const send = jest.fn()

    const { queryByText, queryByPlaceholderText, findByText } = render(
      <Provider store={store}>
        <ChatDialog sendTo={send} />
      </Provider>
    )

    const input = queryByPlaceholderText('Send to local chat')
    expect(input).toBeTruthy()
    expect(input.nodeName).toBe('INPUT')
    expect(input.type).toBe('text')

    const sendButton = queryByText('send')
    expect(sendButton).toBeTruthy()
    expect(sendButton.nodeName).toBe('BUTTON')

    expect(queryByText('Look there!')).toBeTruthy()
    expect(queryByText('Hello world!')).toBeFalsy()

    fireEvent.change(input, {
      target: {
        value: 'Hello World!'
      }
    })
    fireEvent.submit(await findByText('send'))

    expect(send.mock.calls).toEqual([
      ['Hello World!']
    ])
  })

  it('should pass aXe', async () => {
    const store = configureStore({
      IMs: {
        chats: {
          2345: {
            sessionId: '2345',
            withId: 'first',
            isIM: true,
            messages: []
          }
        },
        messages: {
          2345: []
        }
      },
      localChat: [],
      names: {
        names: {
          first: new AvatarName('Testery MacTestface')
        }
      }
    })

    const { container } = render(
      <Provider store={store}>
        <ChatDialog isIM={false} sendTo={() => {}} />
      </Provider>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('IM chat', () => {
  it('renders', async () => {
    const imData = {
      sessionId: 'abc',
      saveId: 'def'
    }

    const store = configureStore({
      IMs: {
        messages: {
          abc: [
            {
              _id: 'something/def/20202020',
              fromId: 'first',
              fromName: 'Testery MacTestface',
              message: 'Hello world!',
              time: 10,
              didSave: true,
              offline: false
            }
          ]
        }
      },
      localChat: [
        {
          _id: 'something/def/20202020',
          fromId: 'second',
          fromName: 'Happy User',
          message: 'Look there!',
          time: 10,
          didSave: true,
          offline: false
        }
      ],
      names: {
        names: {
          first: new AvatarName('Testery MacTestface'),
          second: new AvatarName('Happy User')
        }
      }
    })

    const send = jest.fn()
    const loadHistory = jest.fn()

    const { queryByText, queryByPlaceholderText, findByText } = render(
      <Provider store={store}>
        <ChatDialog
          isIM
          data={imData}
          sendTo={send}
          loadHistory={loadHistory}
        />
      </Provider>
    )

    const input = queryByPlaceholderText('Send Instant Message')
    expect(input).toBeTruthy()
    expect(input.nodeName).toBe('INPUT')
    expect(input.type).toBe('text')

    const sendButton = queryByText('send')
    expect(sendButton).toBeTruthy()
    expect(sendButton.nodeName).toBe('BUTTON')

    expect(queryByText('Hello world!')).toBeTruthy()
    expect(queryByText('Look there!')).toBeFalsy()

    fireEvent.change(input, {
      target: {
        value: 'Hello World!'
      }
    })
    fireEvent.submit(await findByText('send'))

    expect(send.mock.calls).toEqual([
      ['Hello World!']
    ])

    expect(loadHistory.mock.calls).toEqual([
      [imData.sessionId, imData.saveId]
    ])
  })

  it('should pass aXe', async () => {
    const imData = {
      sessionId: 'abc',
      saveId: 'def',
      messages: []
    }

    const store = configureStore({
      IMs: {
        messages: {
          abc: [
            {
              _id: 'something/def/20202020',
              fromId: 'first',
              fromName: 'Testery MacTestface',
              message: 'Hello world!',
              time: 10,
              didSave: true,
              offline: false
            }
          ]
        }
      },
      localChat: [],
      names: {
        names: {
          first: new AvatarName('Testery MacTestface')
        }
      }
    })

    const { container } = render(
      <Provider store={store}>
        <ChatDialog
          isIM
          data={imData}
          sendTo={() => {}}
          loadHistory={() => {}}
        />
      </Provider>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
