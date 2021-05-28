import { axe } from 'jest-axe'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'

import ChatMessagesList from './chatMessagesList'
import { addMissing } from '../bundles/names'
import configureStore from '../store/configureStore'

import { LocalChatSourceType } from '../types/chat'

jest.mock('../reactors/index.ts', () => [])

function getTimeString (timeSting) {
  const date = new Date(timeSting)
  const h = date.getHours().toString().padStart(2, '0')
  const m = date.getMinutes().toString().padStart(2, '0')
  const s = date.getSeconds().toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

function createStore (names) {
  const store = configureStore()
  for (const [key, name] of Object.entries(names)) {
    store.dispatch(addMissing({
      id: key,
      fallback: name
    }))
  }
  return store
}

describe('local chat', () => {
  it('renders without crashing', () => {
    const messages = [
      {
        _id: 'first',
        sourceType: LocalChatSourceType.Agent,
        fromId: 'ABCB',
        message: 'Hello world!',
        time: '2018-08-10T11:03:00.000Z'
      },
      {
        _id: 'second',
        sourceType: LocalChatSourceType.Agent,
        fromId: '1234',
        message: 'How are you?',
        time: '2018-08-10T11:03:32.734Z'
      }
    ]

    const names = {
      ABCB: 'Testery MacTestface',
      1234: 'Viewerer Account'
    }

    const { queryByText } = render(
      <Provider store={createStore(names)}>
        <ChatMessagesList messages={messages} />
      </Provider>
    )

    expect(queryByText(getTimeString('2018-08-10T11:03:00.000Z'))).toBeTruthy()
    expect(queryByText(getTimeString('2018-08-10T11:03:00.000Z')).tagName).toBe('TIME')
    expect(queryByText('Testery Mactestface', { selector: '[aria-hidden=true]' })).toBeTruthy()
    expect(queryByText('Testery Mactestface', { selector: '.sr-only' })).toBeTruthy()
    expect(queryByText('Hello world!')).toBeTruthy()

    expect(queryByText(getTimeString('2018-08-10T11:03:32.734Z'))).toBeTruthy()
    expect(queryByText(getTimeString('2018-08-10T11:03:32.734Z')).tagName).toBe('TIME')
    expect(queryByText('Viewerer Account', { selector: '[aria-hidden=true]' })).toBeTruthy()
    expect(queryByText('Viewerer Account', { selector: '.sr-only' })).toBeTruthy()
    expect(queryByText('How are you?')).toBeTruthy()
  })

  it('renders plain urls and urls with second life formation', () => {
    const messages = [
      {
        _id: 'first',
        sourceType: LocalChatSourceType.Agent,
        fromId: 'ABCB',
        message: "An article https://en.wikipedia.org/wiki/Second_Life. Isn't it nice?",
        time: '2018-08-10T11:03:00.000Z'
      },
      {
        _id: 'second',
        sourceType: LocalChatSourceType.Agent,
        fromId: '1234',
        message: 'Please visit [http://wiki.secondlife.com/wiki/Main_Page the second life wiki]!',
        time: '2018-08-10T11:03:32.734Z'
      }
    ]

    const names = {
      ABCB: 'Testery MacTestface',
      1234: 'Viewerer Account'
    }

    const { queryByText } = render(
      <Provider store={createStore(names)}>
        <ChatMessagesList messages={messages} />
      </Provider>
    )

    // first message
    expect(queryByText(getTimeString('2018-08-10T11:03:00.000Z'))).toBeTruthy()
    expect(queryByText(getTimeString('2018-08-10T11:03:00.000Z')).tagName).toBe('TIME')
    expect(queryByText('Testery Mactestface', { selector: '[aria-hidden=true]' })).toBeTruthy()
    expect(queryByText('Testery Mactestface', { selector: '.sr-only' })).toBeTruthy()

    expect(queryByText('https://en.wikipedia.org/wiki/Second_Life')).toBeTruthy()
    expect(queryByText('https://en.wikipedia.org/wiki/Second_Life').tagName).toBe('A')
    expect(queryByText('https://en.wikipedia.org/wiki/Second_Life').href)
      .toBe('https://en.wikipedia.org/wiki/Second_Life')
    expect(queryByText('https://en.wikipedia.org/wiki/Second_Life').rel)
      .toBe('noopener noreferrer')

    // second message
    expect(queryByText(getTimeString('2018-08-10T11:03:32.734Z'))).toBeTruthy()
    expect(queryByText(getTimeString('2018-08-10T11:03:32.734Z')).tagName).toBe('TIME')
    expect(queryByText('Viewerer Account', { selector: '[aria-hidden=true]' })).toBeTruthy()
    expect(queryByText('Viewerer Account', { selector: '.sr-only' })).toBeTruthy()

    expect(queryByText('the second life wiki')).toBeTruthy()
    expect(queryByText('the second life wiki').tagName).toBe('A')
    expect(queryByText('the second life wiki').href)
      .toBe('http://wiki.secondlife.com/wiki/Main_Page')
    expect(queryByText('the second life wiki').rel)
      .toBe('noopener noreferrer')
  })

  it('should render messages starting with /me without a colon', () => {
    const messages = [
      {
        _id: 'first',
        sourceType: LocalChatSourceType.Agent,
        fromId: 'ABCB',
        message: '/me wonders about the world!',
        time: '2018-08-10T11:03:00.000Z'
      }
    ]

    const names = {
      ABCB: 'Testery MacTestface'
    }

    const { queryByText } = render(
      <Provider store={createStore(names)}>
        <ChatMessagesList messages={messages} />
      </Provider>
    )

    expect(queryByText(getTimeString('2018-08-10T11:03:00.000Z'))).toBeTruthy()
    expect(queryByText(getTimeString('2018-08-10T11:03:00.000Z')).tagName).toBe('TIME')
    expect(queryByText('Testery Mactestface', { selector: '[aria-hidden="true"]' })).toBeTruthy()
    expect(queryByText('Testery Mactestface', { selector: '.sr-only' })).toBeTruthy()
    expect(queryByText('wonders about the world!')).toBeTruthy()
  })

  it("should render messages from objects with the object name and not load it's name", () => {
    const messages = [
      {
        _id: 'first',
        sourceType: LocalChatSourceType.Object,
        fromName: 'Some Object',
        fromId: 'e856f8e7-f774-4040-8392-df4185fa37e4',
        message: "An article https://en.wikipedia.org/wiki/Second_Life. Isn't it nice?",
        time: '2018-08-10T11:03:00.000Z'
      }
    ]

    const store = createStore({
      ABCB: 'Testery MacTestface',
      1234: 'Viewerer Account'
    })

    const { queryByText } = render(
      <Provider store={store}>
        <ChatMessagesList messages={messages} />
      </Provider>
    )

    expect(queryByText('Some Object', { selector: '[aria-hidden="true"]' })).toBeTruthy()
    expect(queryByText('Some Object', { selector: '.sr-only' })).toBeTruthy()
    expect(store.getState().names.names).not.toHaveProperty(
      ['e856f8e7-f774-4040-8392-df4185fa37e4']
    )
  })

  it('should pass aXe', async () => {
    const messages = [
      {
        _id: 'first',
        sourceType: LocalChatSourceType.Agent,
        fromId: 'ABCB',
        message: 'Hello world!',
        time: '2018-08-10T11:03:00.000Z'
      },
      {
        _id: 'second',
        sourceType: LocalChatSourceType.Agent,
        fromId: '1234',
        message: 'How are you?',
        time: '2018-08-10T11:03:32.734Z'
      }
    ]

    const names = {
      ABCB: 'Testery MacTestface',
      1234: 'Viewerer Account'
    }

    const { container } = render(
      <Provider store={createStore(names)}>
        <ChatMessagesList messages={messages} />
      </Provider>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('IMs', () => {
  it('renders without crashing', () => {
    const messages = [
      {
        _id: 'first',
        fromId: 'ABCB',
        message: 'Hello world!',
        time: '2018-08-10T11:03:00.000Z'
      },
      {
        _id: 'second',
        fromId: '1234',
        message: 'How are you?',
        time: '2018-08-10T11:03:32.734Z'
      }
    ]

    const names = {
      ABCB: 'Testery MacTestface',
      1234: 'Viewerer Account'
    }

    const { queryByText } = render(
      <Provider store={createStore(names)}>
        <ChatMessagesList messages={messages} isIM />
      </Provider>
    )

    expect(queryByText(getTimeString('2018-08-10T11:03:00.000Z'))).toBeTruthy()
    expect(queryByText(getTimeString('2018-08-10T11:03:00.000Z')).tagName).toBe('TIME')
    expect(queryByText('Testery Mactestface', { selector: '[aria-hidden=true]' })).toBeTruthy()
    expect(queryByText('Testery Mactestface', { selector: '.sr-only' })).toBeTruthy()
    expect(queryByText('Hello world!')).toBeTruthy()

    expect(queryByText(getTimeString('2018-08-10T11:03:32.734Z'))).toBeTruthy()
    expect(queryByText(getTimeString('2018-08-10T11:03:32.734Z')).tagName).toBe('TIME')
    expect(queryByText('Viewerer Account', { selector: '[aria-hidden=true]' })).toBeTruthy()
    expect(queryByText('Viewerer Account', { selector: '.sr-only' })).toBeTruthy()
    expect(queryByText('How are you?')).toBeTruthy()
  })

  it('renders plain urls and urls with second life formation', () => {
    const messages = [
      {
        _id: 'first',
        fromId: 'ABCB',
        message: "An article https://en.wikipedia.org/wiki/Second_Life. Isn't it nice?",
        time: '2018-08-10T11:03:00.000Z'
      },
      {
        _id: 'second',
        fromId: '1234',
        message: 'Please visit [http://wiki.secondlife.com/wiki/Main_Page the second life wiki]!',
        time: '2018-08-10T11:03:32.734Z'
      }
    ]

    const names = {
      ABCB: 'Testery MacTestface',
      1234: 'Viewerer Account'
    }

    const { queryByText } = render(
      <Provider store={createStore(names)}>
        <ChatMessagesList messages={messages} isIM />
      </Provider>
    )

    // first message
    expect(queryByText(getTimeString('2018-08-10T11:03:00.000Z'))).toBeTruthy()
    expect(queryByText(getTimeString('2018-08-10T11:03:00.000Z')).tagName).toBe('TIME')
    expect(queryByText('Testery Mactestface', { selector: '[aria-hidden=true]' })).toBeTruthy()
    expect(queryByText('Testery Mactestface', { selector: '.sr-only' })).toBeTruthy()

    expect(queryByText('https://en.wikipedia.org/wiki/Second_Life')).toBeTruthy()
    expect(queryByText('https://en.wikipedia.org/wiki/Second_Life').tagName).toBe('A')
    expect(queryByText('https://en.wikipedia.org/wiki/Second_Life').href)
      .toBe('https://en.wikipedia.org/wiki/Second_Life')
    expect(queryByText('https://en.wikipedia.org/wiki/Second_Life').rel)
      .toBe('noopener noreferrer')

    // second message
    expect(queryByText(getTimeString('2018-08-10T11:03:32.734Z'))).toBeTruthy()
    expect(queryByText(getTimeString('2018-08-10T11:03:32.734Z')).tagName).toBe('TIME')
    expect(queryByText('Viewerer Account', { selector: '[aria-hidden=true]' })).toBeTruthy()
    expect(queryByText('Viewerer Account', { selector: '.sr-only' })).toBeTruthy()

    expect(queryByText('the second life wiki')).toBeTruthy()
    expect(queryByText('the second life wiki').tagName).toBe('A')
    expect(queryByText('the second life wiki').href)
      .toBe('http://wiki.secondlife.com/wiki/Main_Page')
    expect(queryByText('the second life wiki').rel)
      .toBe('noopener noreferrer')
  })

  it('should render messages starting with /me without a colon', () => {
    const messages = [
      {
        _id: 'first',
        fromId: 'ABCB',
        message: '/me wonders about the world!',
        time: '2018-08-10T11:03:00.000Z'
      }
    ]

    const names = {
      ABCB: 'Testery MacTestface'
    }

    const { queryByText } = render(
      <Provider store={createStore(names)}>
        <ChatMessagesList messages={messages} isIM />
      </Provider>
    )

    expect(queryByText(getTimeString('2018-08-10T11:03:00.000Z'))).toBeTruthy()
    expect(queryByText(getTimeString('2018-08-10T11:03:00.000Z')).tagName).toBe('TIME')
    expect(queryByText('Testery Mactestface', { selector: '[aria-hidden="true"]' })).toBeTruthy()
    expect(queryByText('Testery Mactestface', { selector: '.sr-only' })).toBeTruthy()
    expect(queryByText('wonders about the world!')).toBeTruthy()
  })

  it('should pass aXe', async () => {
    const messages = [
      {
        _id: 'first',
        fromId: 'ABCB',
        message: 'Hello world!',
        time: '2018-08-10T11:03:00.000Z'
      },
      {
        _id: 'second',
        fromId: '1234',
        message: 'How are you?',
        time: '2018-08-10T11:03:32.734Z'
      }
    ]

    const names = {
      ABCB: 'Testery MacTestface',
      1234: 'Viewerer Account'
    }

    const { container } = render(
      <Provider store={createStore(names)}>
        <ChatMessagesList messages={messages} isIM />
      </Provider>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
