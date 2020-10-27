import { axe } from 'jest-axe'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { render } from '@testing-library/react'

import ChatBox from './chatBox'
import AvatarName from '../avatarName'

function configureStore (state = {}) {
  const store = configureMockStore([thunk])
  return store(state)
}

it('renders without crashing', () => {
  const store = configureStore({
    friends: [
      {
        id: 'first',
        rightsGiven: {},
        rightsHas: {}
      }
    ],
    groups: [
      {
        id: 'abcd',
        name: 'Great group',
        insigniaID: 'dcba',
        title: 'Person',
        acceptNotices: true,
        powers: [0, 0],
        listInProfile: true,
        sessionStarted: true
      }
    ],
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
    },
    notifications: { active: [] },
    session: { activeChatTab: 'local' }
  })

  const { container } = render(
    <Provider store={store}>
      <ChatBox
        selfName={new AvatarName('self Resident')}
        sendLocalChatMessage={() => {}}
      />
    </Provider>
  )

  expect(container).toBeTruthy()
})

it('should pass aXe', async () => {
  const store = configureStore({
    friends: [
      {
        id: 'first',
        rightsGiven: {},
        rightsHas: {}
      }
    ],
    groups: [
      {
        id: 'abcd',
        name: 'Great group',
        insigniaID: 'dcba',
        title: 'Person',
        acceptNotices: true,
        powers: [0, 0],
        listInProfile: true,
        sessionStarted: true
      }
    ],
    IMs: {
      chats: {
        2345: {
          name: 'first chat',
          sessionId: '2345',
          withId: 'first',
          isIM: true
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
    },
    notifications: { active: [] },
    session: { activeChatTab: 'local' }
  })

  const { container } = render(
    <Provider store={store}>
      <ChatBox
        selfName={new AvatarName('self Resident')}
        sendLocalChatMessage={() => {}}
      />
    </Provider>
  )

  expect(await axe(container)).toHaveNoViolations()
})
