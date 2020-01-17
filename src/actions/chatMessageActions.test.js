import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { v4 as uuid } from 'uuid'
import { UUID as LLUUID } from '../llsd'
import mockdate from 'mockdate'

import {
  receiveChatFromSimulator,
  sendLocalChatMessage,
  saveLocalChatMessages,
  getLocalChatHistory,
  deleteOldLocalChat,
  sendInstantMessage,
  retrieveInstantMessages,
  receiveIM,
  saveIMChatInfos,
  loadIMChats,
  startNewIMChat,
  getIMHistory
} from './chatMessageActions'

import AvatarName from '../avatarName'

import { Maturity } from '../types/viewer'
import {
  LocalChatSourceType,
  LocalChatType,
  LocalChatAudible,
  IMDialog,
  IMChatType,
  NotificationTypes
} from '../types/chat'
import { AssetType } from '../types/inventory'

const mockStore = configureMockStore([thunk])

jest.mock('uuid')
mockdate.set(1562630524418)

describe('local chat', () => {
  it('should handle receiving local chat', () => {
    const store = mockStore({
      account: {
        savedAvatars: [
          {
            avatarIdentifier: 'Tester',
            dataSaveId: 'saveId'
          }
        ]
      },
      session: {
        avatarIdentifier: 'Tester'
      }
    })

    store.dispatch(receiveChatFromSimulator(createChatFromSimulator()))

    store.dispatch(receiveChatFromSimulator(createChatFromSimulator({
      fromObject: true
    })))

    expect(store.getActions()).toEqual([
      {
        type: 'localChat/received',
        payload: {
          _id: 'saveId/localchat/2019-07-09T00:02:04.418Z',
          fromName: 'Tester MacTestface',
          fromId: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
          ownerId: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
          sourceType: LocalChatSourceType.Agent,
          chatType: LocalChatType.Normal,
          audible: LocalChatAudible.Fully,
          position: [0, 0, 0],
          message: 'Hello Tests. I hope you pass!',
          time: 1562630524418
        }
      },
      {
        type: 'localChat/received',
        payload: {
          _id: 'saveId/localchat/2019-07-09T00:02:04.418Z',
          fromName: 'Tester MacTestface',
          fromId: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
          ownerId: 'f2373437-a2ef-4435-82b9-68d283538bb2',
          sourceType: LocalChatSourceType.Object,
          chatType: LocalChatType.Normal,
          audible: LocalChatAudible.Fully,
          position: [0, 0, 0],
          message: 'Hello Tests. I hope you pass!',
          time: 1562630524418
        }
      }
    ])
  })

  it('should send local chat', () => {
    const send = jest.fn()

    const store = configureMockStore([
      thunk.withExtraArgument({ circuit: { send } })
    ])({
      session: {
        agentId: 'e0f1adac-d250-4d71-b4e4-10e0ee855d0e',
        sessionId: 'b039f51f-41d9-41e7-a4b1-5490fbfd5eb9'
      }
    })

    store.dispatch(
      sendLocalChatMessage('Hello darkness, my old friend', LocalChatType.Normal, 0)
    )

    expect(send.mock.calls[0]).toEqual([
      'ChatFromViewer',
      {
        AgentData: [
          {
            AgentID: 'e0f1adac-d250-4d71-b4e4-10e0ee855d0e',
            SessionID: 'b039f51f-41d9-41e7-a4b1-5490fbfd5eb9'
          }
        ],
        ChatData: [
          {
            Message: 'Hello darkness, my old friend',
            Type: LocalChatType.Normal,
            Channel: 0
          }
        ]
      },
      true
    ])

    expect(store.getActions()).toEqual([])
  })

  it('should save local chat messages', async () => {
    const updateOrAdd = jest.fn(([shouldPass, shouldFail]) => {
      const passingResult = JSON.parse(JSON.stringify({
        ...shouldPass,
        _rev: '1-a_hash'
      }))

      const errorResult = new Error('Did fail')

      return Promise.resolve([passingResult, errorResult])
    })

    const localChat = [
      {
        _id: 'saveId/localchat/2019-07-09T00:01:04.418Z',
        fromName: 'Tester MacTestface',
        fromId: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
        ownerId: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
        sourceType: LocalChatSourceType.Agent,
        chatType: LocalChatType.Normal,
        audible: LocalChatAudible.Fully,
        position: [0, 0, 0],
        message: 'This should not be saved',
        time: 1562630524418,
        didSave: true
      },
      {
        _id: 'saveId/localchat/2019-07-09T00:02:04.418Z',
        fromName: 'Tester MacTestface',
        fromId: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
        ownerId: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
        sourceType: LocalChatSourceType.Agent,
        chatType: LocalChatType.Normal,
        audible: LocalChatAudible.Fully,
        position: [0, 0, 0],
        message: 'Hello Tests. I hope you pass!',
        time: 1562630524418,
        didSave: false
      },
      {
        _id: 'saveId/localchat/2019-07-09T00:03:04.418Z',
        fromName: 'Tester MacTestface',
        fromId: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
        ownerId: 'f2373437-a2ef-4435-82b9-68d283538bb2',
        sourceType: LocalChatSourceType.Object,
        chatType: LocalChatType.Normal,
        audible: LocalChatAudible.Fully,
        position: [0, 0, 0],
        message: 'Hello Tests. I hope you pass!',
        time: 1562630524418,
        didSave: false
      }
    ]

    const store = configureMockStore([
      thunk.withExtraArgument({
        hoodie: {
          cryptoStore: {
            updateOrAdd
          }
        }
      })
    ])({
      session: {
        agentId: 'e0f1adac-d250-4d71-b4e4-10e0ee855d0e',
        sessionId: 'b039f51f-41d9-41e7-a4b1-5490fbfd5eb9'
      },
      localChat
    })

    const didFinish = store.dispatch(saveLocalChatMessages())

    expect(store.getActions()).toEqual([
      {
        type: 'localChat/savingStarted',
        payload: [
          'saveId/localchat/2019-07-09T00:03:04.418Z',
          'saveId/localchat/2019-07-09T00:02:04.418Z'
        ]
      }
    ])

    store.clearActions()

    await didFinish

    expect(updateOrAdd.mock.calls[0]).toEqual([
      [
        {
          ...localChat[2],
          sourceType: 'object',
          chatType: 'normal',
          audible: 'fully',
          position: undefined,
          didSave: undefined
        },
        {
          ...localChat[1],
          sourceType: 'agent',
          chatType: 'normal',
          audible: 'fully',
          ownerId: undefined,
          position: undefined,
          didSave: undefined
        }
      ]
    ])

    const eventObject = {
      ...localChat[2],
      _rev: '1-a_hash'
    }
    delete eventObject.position
    delete eventObject.didSave

    expect(store.getActions()).toEqual([
      {
        type: 'localChat/savingFinished',
        payload: {
          saved: [eventObject],
          didError: [
            'saveId/localchat/2019-07-09T00:02:04.418Z'
          ]
        }
      }
    ])
  })

  it('should load local chat', async () => {
    const findAll = jest.fn(() => Promise.resolve([
      {
        _id: '1',
        data: 1
      }
    ]))
    const withIdPrefix = jest.fn(() => ({ findAll }))

    const store = configureMockStore([thunk.withExtraArgument({
      hoodie: {
        cryptoStore: {
          withIdPrefix
        }
      }
    })])()

    const result = await store.dispatch(getLocalChatHistory('anAvatar'))

    expect(withIdPrefix.mock.calls).toEqual([
      [
        'anAvatar/localchat/'
      ]
    ])
    expect(findAll.mock.calls.length).toBe(1)
    expect(result).toEqual([
      {
        _id: '1',
        data: 1
      }
    ])
  })

  it('should deleting old local chat', async () => {
    const removeFn = jest.fn(docs => Promise.resolve(docs))

    const localChat = [
      {
        _id: 'messageOfTheDay',
        message: 'The cake is a lie!'
      }
    ]

    const account = {
      loggedIn: true
    }

    const session = {
      sync: true
    }

    for (let i = 0; i < 250; ++i) {
      localChat.push({
        _id: 'anId_' + i,
        _rev: '1-a_hash',
        message: `I can count to ${i}!`
      })
    }

    const storeWithToMuch = configureMockStore([
      thunk.withExtraArgument({
        hoodie: {
          cryptoStore: {
            remove: removeFn
          }
        }
      })
    ])({ account, session, localChat })

    await storeWithToMuch.dispatch(deleteOldLocalChat())

    expect(removeFn.mock.calls[0][0].length).toBe(50)
    expect(removeFn.mock.calls[0][0][0]).toBe('anId_0')
    expect(removeFn.mock.calls[0][0][49]).toBe('anId_49')
    expect(removeFn.mock.calls[0][0].includes('messageOfTheDay')).toBeFalsy()

    const storeWithLess = configureMockStore([
      thunk.withExtraArgument({
        hoodie: {
          cryptoStore: {
            remove: removeFn
          }
        }
      })
    ])({ account, session, localChat: localChat.slice(0, 200) })

    await storeWithLess.dispatch(deleteOldLocalChat())

    expect(removeFn.mock.calls.length).toBe(1)
  })

  /**
   * Helper function to create an ChatFromSimulator
   * @param {object} options Arguments
   * @param {string?} options.fromName A name.
   * @param {boolean?} options.fromObject Is message from an object?
   * @param {LocalChatSourceType?} options.sourceType Type of the sender.
   * @param {LocalChatType?} options.chatType Type of the chat message.
   * @param {LocalChatAudible?} options.audible How good can it be heard?
   * @param {string?} options.message Test send.
   */
  function createChatFromSimulator (options = {}) {
    return {
      ChatData: [
        {
          FromName: createStringBuffer(options.fromName || 'Tester MacTestface'),
          SourceID: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
          OwnerID: options.fromObject
            ? 'f2373437-a2ef-4435-82b9-68d283538bb2'
            : '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
          SourceType: options.sourceType || (options.fromObject
            ? LocalChatSourceType.Object
            : LocalChatSourceType.Agent),
          ChatType: options.chatType == null ? LocalChatType.Normal : options.chatType,
          Audible: options.audible == null ? LocalChatAudible.Fully : options.audible,
          Position: [0, 0, 0],
          Message: createStringBuffer(options.message || 'Hello Tests. I hope you pass!')
        }
      ]
    }
  }
})

describe('save, loading and sending IMs', () => {
  it('should handle saving IM chat infos', async () => {
    const findOrAdd = jest.fn(docs => Promise.resolve([
      {
        ...docs[0],
        _rev: '1-1234567890'
      },
      new Error('did fail to save')
    ]))

    const store = configureMockStore([thunk.withExtraArgument({
      hoodie: {
        cryptoStore: {
          findOrAdd
        }
      }
    })])({
      IMs: {
        abcd: {
          _id: 'an-id',
          sessionId: 'abcd',
          saveId: 'dcba',
          type: IMChatType.personal,
          target: 'f2373437-a2ef-4435-82b9-68d283538bb2',
          name: 'Tester MacTestface',

          didSaveChatInfo: false,
          didLoadHistory: false,
          isLoadingHistory: false,
          active: false,
          hasUnsavedMSG: false,
          areTyping: new Set(),
          messages: []
        },
        willError: {
          _id: 'an-id-too',
          sessionId: 'willError',
          saveId: 'xyz',
          type: IMChatType.group,
          target: 'e0f1adac-d250-4d71-b4e4-10e0ee855d0e',
          name: 'Great group',

          didSaveChatInfo: false,
          didLoadHistory: false,
          isLoadingHistory: false,
          active: false,
          hasUnsavedMSG: false,
          areTyping: new Set(),
          messages: []
        },
        12345: {
          _id: 'another-id',
          sessionId: '12345',
          saveId: '67890',
          type: IMChatType.personal,
          target: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
          name: 'New Person',

          didSaveChatInfo: true,
          didLoadHistory: false,
          isLoadingHistory: false,
          active: false,
          hasUnsavedMSG: false,
          areTyping: new Set(),
          messages: []
        }
      }
    })

    const didFinish = store.dispatch(saveIMChatInfos())

    expect(store.getActions()).toEqual([
      {
        type: 'im/startSavingInfo',
        payload: ['abcd', 'willError']
      }
    ])

    store.clearActions()

    await didFinish

    expect(store.getActions()).toEqual([
      {
        type: 'im/finishedSavingInfo',
        payload: {
          didError: ['willError']
        }
      }
    ])

    expect(findOrAdd.mock.calls[0][0]).toEqual([
      {
        _id: 'an-id',
        sessionId: 'abcd',
        saveId: 'dcba',
        chatType: 'personal',
        target: 'f2373437-a2ef-4435-82b9-68d283538bb2',
        name: 'Tester MacTestface'
      },
      {
        _id: 'an-id-too',
        sessionId: 'willError',
        saveId: 'xyz',
        chatType: 'group',
        target: 'e0f1adac-d250-4d71-b4e4-10e0ee855d0e',
        name: 'Great group'
      }
    ])
  })

  it('should load IM Chat infos', () => {
    const docA = {
      _id: 'an-id',
      sessionId: 'abcd',
      saveId: 'dcba',
      chatType: 'personal',
      target: 'f2373437-a2ef-4435-82b9-68d283538bb2',
      name: 'Tester MacTestface'
    }
    const docB = {
      _id: 'an-id-too',
      sessionId: '1234567',
      saveId: 'xyz',
      chatType: 'group',
      target: 'e0f1adac-d250-4d71-b4e4-10e0ee855d0e',
      name: 'Great group'
    }

    const hoodieEventCallbacks = []
    const hoodieOneEvent = jest.fn((_, callback) => { hoodieEventCallbacks.push(callback) })

    const callbacks = []
    const storeOn = jest.fn((_, callback) => { callbacks.push(callback) })
    const storeOff = jest.fn()
    const storeFindAll = jest.fn(() => {
      return {
        then: (fn) => fn([docA, docB])
      }
    })

    const withIdPrefix = jest.fn(() => ({
      findAll: storeFindAll,
      on: storeOn,
      off: storeOff
    }))

    const store = configureMockStore([thunk.withExtraArgument({
      hoodie: {
        one: hoodieOneEvent,
        cryptoStore: {
          withIdPrefix
        }
      }
    })])({
      account: {
        loggedIn: true,
        savedAvatars: [
          {
            avatarIdentifier: 1,
            dataSaveId: 'an-id'
          }
        ]
      },
      session: {
        avatarIdentifier: 1
      }
    })

    store.dispatch(loadIMChats())

    expect(store.getActions()).toEqual([
      {
        type: 'im/infosLoaded',
        payload: [
          {
            ...docA,
            chatType: IMChatType.personal
          },
          {
            ...docB,
            chatType: IMChatType.group
          }
        ]
      }
    ])

    store.clearActions()

    expect(callbacks.length).toBe(1)
    expect(storeOn.mock.calls[0][0]).toBe('add')
    expect(typeof storeOn.mock.calls[0][1]).toBe('function')

    expect(storeOff.mock.calls.length).toBe(0)

    expect(hoodieEventCallbacks.length).toBe(1)
    expect(hoodieOneEvent.mock.calls[0][0]).toBe('avatarDidLogout')
    expect(typeof hoodieOneEvent.mock.calls[0][1]).toBe('function')

    const doc = {
      _id: 'another-id',
      sessionId: '12345',
      saveId: '67890',
      chatType: 'personal',
      target: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
      name: 'New Person'
    }
    callbacks[0](doc)

    expect(store.getActions()).toEqual([
      {
        type: 'im/infosLoaded',
        payload: [{
          ...doc,
          chatType: IMChatType.personal
        }]
      }
    ])

    hoodieEventCallbacks[0]()

    expect(storeOff.mock.calls.length).toBe(1)
    expect(storeOff.mock.calls[0][0]).toBe('add')
    expect(storeOff.mock.calls[0][1]).toBe(callbacks[0])
  })

  it('should load IM chat history', async () => {
    const shouldResolveWith = {
      error: null,
      value: null
    }
    let findResult = null

    const allDocs = jest.fn(() => {
      if (shouldResolveWith.error != null) {
        return Promise.reject(shouldResolveWith.error)
      }
      return Promise.resolve(shouldResolveWith.value)
    })

    const find = jest.fn(() => Promise.resolve(findResult))

    const findAll = jest.fn(() => Promise.resolve(findResult))
    const withIdPrefix = jest.fn(() => ({ findAll }))

    const store = configureMockStore([thunk.withExtraArgument({
      hoodie: {
        store: {
          db: { allDocs }
        },
        cryptoStore: {
          find,
          withIdPrefix
        }
      }
    })])({
      account: {
        savedAvatars: [
          {
            avatarIdentifier: 'test@sl',
            dataSaveId: 'saveId'
          }
        ]
      },
      session: {
        agentId: 'e0f1adac-d250-4d71-b4e4-10e0ee855d0e',
        sessionId: 'b039f51f-41d9-41e7-a4b1-5490fbfd5eb9',
        avatarIdentifier: 'test@sl'
      },
      IMs: {
        '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25': {
          name: 'Buddy',
          target: 'f2373437-a2ef-4435-82b9-68d283538bb2',
          saveId: 'abcd',
          type: IMChatType.personal,
          messages: [
            { _id: 'saveId/imChats/abcd/2019-07-09T00:02:04.000Z' }
          ]
        },
        'da4bf092-5e29-4577-a662-171bd57915f8': {
          name: 'Best group',
          target: 'da4bf092-5e29-4577-a662-171bd57915f8',
          saveId: 'efgh',
          type: IMChatType.group,
          messages: []
        }
      }
    })

    // Can access PouchDb instance & load all

    shouldResolveWith.value = {
      rows: [
        { id: 'saveId/imChats/abcd/2019-07-07T00:02:04.000Z' },
        { id: 'saveId/imChats/abcd/2019-07-08T00:02:04.000Z' },
        { id: 'saveId/imChats/abcd/2019-07-09T00:02:04.000Z' }
      ]
    }
    findResult = [
      { _id: 'saveId/imChats/abcd/2019-07-08T00:02:04.000Z', message: 'Hello' },
      { _id: 'saveId/imChats/abcd/2019-07-07T00:02:04.000Z', message: 'Hello' }
    ]
    await store.dispatch(getIMHistory('5657e9ca-315c-47e3-bfde-7bfe2e5b7e25', 'abcd'))

    expect(allDocs.mock.calls.length).toBe(1)
    expect(allDocs.mock.calls[0]).toEqual([
      {
        startkey: 'saveId/imChats/abcd/2019-07-09T00:02:04.000Z',
        endkey: 'saveId/imChats/abcd',
        limit: 101,
        descending: true
      }
    ])

    expect(find.mock.calls.length).toBe(1)
    expect(find.mock.calls[0]).toEqual([
      [
        'saveId/imChats/abcd/2019-07-08T00:02:04.000Z',
        'saveId/imChats/abcd/2019-07-07T00:02:04.000Z'
      ]
    ])

    expect(store.getActions()).toEqual([
      {
        type: 'im/historyLoadingStarted',
        payload: {
          sessionId: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25'
        }
      },
      {
        type: 'im/historyLoadingFinished',
        payload: {
          sessionId: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
          messages: findResult,
          didLoadAll: true
        }
      }
    ])

    shouldResolveWith.value = null
    findResult = null
    store.clearActions()

    // can access PouchDb & loads all but no message

    shouldResolveWith.value = {
      rows: [
        { id: 'saveId/imChats/efgh/2019-07-07T00:02:04.000Z' },
        { id: 'saveId/imChats/efgh/2019-07-08T00:02:04.000Z' },
        { id: 'saveId/imChats/efgh/2019-07-09T00:02:04.000Z' }
      ]
    }
    findResult = [
      { _id: 'saveId/imChats/efgh/2019-07-09T00:02:04.000Z', message: 'Hello' },
      { _id: 'saveId/imChats/efgh/2019-07-08T00:02:04.000Z', message: 'Hello' },
      { _id: 'saveId/imChats/efgh/2019-07-07T00:02:04.000Z', message: 'Hello' }
    ]
    await store.dispatch(getIMHistory('da4bf092-5e29-4577-a662-171bd57915f8', 'efgh'))

    expect(allDocs.mock.calls.length).toBe(2)
    expect(allDocs.mock.calls[1]).toEqual([
      {
        startkey: 'saveId/imChats/efgh/\uffff',
        endkey: 'saveId/imChats/efgh',
        limit: 100,
        descending: true
      }
    ])

    expect(find.mock.calls.length).toBe(2)
    expect(find.mock.calls[1]).toEqual([
      [
        'saveId/imChats/efgh/2019-07-09T00:02:04.000Z',
        'saveId/imChats/efgh/2019-07-08T00:02:04.000Z',
        'saveId/imChats/efgh/2019-07-07T00:02:04.000Z'
      ]
    ])

    expect(store.getActions()).toEqual([
      {
        type: 'im/historyLoadingStarted',
        payload: {
          sessionId: 'da4bf092-5e29-4577-a662-171bd57915f8'
        }
      },
      {
        type: 'im/historyLoadingFinished',
        payload: {
          sessionId: 'da4bf092-5e29-4577-a662-171bd57915f8',
          messages: findResult,
          didLoadAll: true
        }
      }
    ])

    shouldResolveWith.value = null
    findResult = null
    store.clearActions()

    // No access to PouchDb

    shouldResolveWith.error = new Error('database is destroyed')
    findResult = [
      { _id: 'saveId/imChats/abcd/2019-07-07T00:02:04.000Z', message: 'Hello' },
      { _id: 'saveId/imChats/abcd/2019-07-08T00:02:04.000Z', message: 'Hello' },
      { _id: 'saveId/imChats/abcd/2019-07-09T00:02:04.000Z', message: 'Hello' }
    ]

    await store.dispatch(getIMHistory('5657e9ca-315c-47e3-bfde-7bfe2e5b7e25', 'abcd'))

    expect(withIdPrefix.mock.calls.length).toBe(1)
    expect(withIdPrefix.mock.calls[0]).toEqual(['saveId/imChats/abcd'])

    expect(findAll.mock.calls.length).toBe(1)

    expect(store.getActions()).toEqual([
      {
        type: 'im/historyLoadingStarted',
        payload: {
          sessionId: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25'
        }
      },
      {
        type: 'im/historyLoadingFinished',
        payload: {
          sessionId: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
          messages: [
            { _id: 'saveId/imChats/abcd/2019-07-07T00:02:04.000Z', message: 'Hello' },
            { _id: 'saveId/imChats/abcd/2019-07-08T00:02:04.000Z', message: 'Hello' }
          ],
          didLoadAll: false
        }
      }
    ])
  })

  it('should send a instant message', async () => {
    const send = jest.fn(() => { Promise.resolve() })

    const store = configureMockStore([thunk.withExtraArgument({
      circuit: { send }
    })])({
      account: {
        savedAvatars: [
          {
            avatarIdentifier: 'test@sl',
            dataSaveId: 'saveId'
          }
        ]
      },
      region: {
        position: [0, 0, 0],
        region: {
          id: 'f276f0f0-a843-46fd-bf4e-7aa3a5deea38',
          parentEstateID: 1
        }
      },
      session: {
        agentId: 'e0f1adac-d250-4d71-b4e4-10e0ee855d0e',
        sessionId: 'b039f51f-41d9-41e7-a4b1-5490fbfd5eb9',
        avatarIdentifier: 'test@sl'
      },
      names: {
        names: {
          'e0f1adac-d250-4d71-b4e4-10e0ee855d0e': new AvatarName('Tester MacTestface')
        }
      },
      IMs: {
        '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25': {
          name: 'Buddy',
          target: 'f2373437-a2ef-4435-82b9-68d283538bb2',
          saveId: 'abcd',
          type: IMChatType.personal
        },
        'da4bf092-5e29-4577-a662-171bd57915f8': {
          name: 'Best group',
          target: 'da4bf092-5e29-4577-a662-171bd57915f8',
          saveId: 'efgh',
          type: IMChatType.group
        },
        'ee6af506-fa78-408d-869f-78305b3889c3': {
          name: 'Dr. Evil Inc.',
          target: 'ee6af506-fa78-408d-869f-78305b3889c3',
          saveId: 'ijkl',
          type: IMChatType.conference
        }
      }
    })

    // Persional
    await store.dispatch(sendInstantMessage(
      'Hello world!',
      'f2373437-a2ef-4435-82b9-68d283538bb2',
      '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
      IMDialog.MessageFromAgent
    ))

    // Group
    await store.dispatch(sendInstantMessage(
      'Hello world!',
      'da4bf092-5e29-4577-a662-171bd57915f8',
      'da4bf092-5e29-4577-a662-171bd57915f8',
      IMDialog.SessionSend
    ))

    // Conference
    await store.dispatch(sendInstantMessage(
      'Hello world!',
      'ee6af506-fa78-408d-869f-78305b3889c3',
      'ee6af506-fa78-408d-869f-78305b3889c3',
      IMDialog.SessionSend
    ))

    expect(send.mock.calls.length).toBe(3)
    expect(send.mock.calls[0]).toEqual([
      'ImprovedInstantMessage',
      {
        AgentData: [
          {
            AgentID: 'e0f1adac-d250-4d71-b4e4-10e0ee855d0e',
            SessionID: 'b039f51f-41d9-41e7-a4b1-5490fbfd5eb9'
          }
        ],
        MessageBlock: [
          {
            FromGroup: false,
            ToAgentID: 'f2373437-a2ef-4435-82b9-68d283538bb2',
            ParentEstateID: 1,
            RegionID: 'f276f0f0-a843-46fd-bf4e-7aa3a5deea38',
            Position: [0, 0, 0],
            Offline: 0,
            Dialog: IMDialog.MessageFromAgent,
            ID: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
            Timestamp: 1562630524,
            FromAgentName: 'Tester Mactestface',
            Message: 'Hello world!',
            BinaryBucket: Buffer.from([])
          }
        ]
      },
      true
    ])

    expect(send.mock.calls[1]).toEqual([
      'ImprovedInstantMessage',
      {
        AgentData: [
          {
            AgentID: 'e0f1adac-d250-4d71-b4e4-10e0ee855d0e',
            SessionID: 'b039f51f-41d9-41e7-a4b1-5490fbfd5eb9'
          }
        ],
        MessageBlock: [
          {
            FromGroup: false,
            ToAgentID: 'da4bf092-5e29-4577-a662-171bd57915f8',
            ParentEstateID: 1,
            RegionID: 'f276f0f0-a843-46fd-bf4e-7aa3a5deea38',
            Position: [0, 0, 0],
            Offline: 0,
            Dialog: IMDialog.SessionSend,
            ID: 'da4bf092-5e29-4577-a662-171bd57915f8',
            Timestamp: 1562630524,
            FromAgentName: 'Tester Mactestface',
            Message: 'Hello world!',
            BinaryBucket: 'Best group'
          }
        ]
      },
      true
    ])

    expect(send.mock.calls[2]).toEqual([
      'ImprovedInstantMessage',
      {
        AgentData: [
          {
            AgentID: 'e0f1adac-d250-4d71-b4e4-10e0ee855d0e',
            SessionID: 'b039f51f-41d9-41e7-a4b1-5490fbfd5eb9'
          }
        ],
        MessageBlock: [
          {
            FromGroup: false,
            ToAgentID: 'ee6af506-fa78-408d-869f-78305b3889c3',
            ParentEstateID: 1,
            RegionID: 'f276f0f0-a843-46fd-bf4e-7aa3a5deea38',
            Position: [0, 0, 0],
            Offline: 0,
            Dialog: IMDialog.SessionSend,
            ID: 'ee6af506-fa78-408d-869f-78305b3889c3',
            Timestamp: 1562630524,
            FromAgentName: 'Tester Mactestface',
            Message: 'Hello world!',
            BinaryBucket: 'Dr. Evil Inc.'
          }
        ]
      },
      true
    ])

    expect(store.getActions()).toEqual([
      {
        type: 'im/received',
        payload: {
          chatType: IMChatType.personal,
          session: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
          msg: {
            _id: 'saveId/imChats/abcd/2019-07-09T00:02:04.000Z',
            fromId: 'e0f1adac-d250-4d71-b4e4-10e0ee855d0e',
            fromName: 'Tester Mactestface',
            message: 'Hello world!',
            offline: 0,
            time: 1562630524000
          }
        }
      },
      {
        type: 'im/received',
        payload: {
          chatType: IMChatType.group,
          session: 'da4bf092-5e29-4577-a662-171bd57915f8',
          msg: {
            _id: 'saveId/imChats/efgh/2019-07-09T00:02:04.000Z',
            fromId: 'e0f1adac-d250-4d71-b4e4-10e0ee855d0e',
            fromName: 'Tester Mactestface',
            message: 'Hello world!',
            time: 1562630524000
          }
        }
      },
      {
        type: 'im/received',
        payload: {
          chatType: IMChatType.conference,
          session: 'ee6af506-fa78-408d-869f-78305b3889c3',
          msg: {
            _id: 'saveId/imChats/ijkl/2019-07-09T00:02:04.000Z',
            fromId: 'e0f1adac-d250-4d71-b4e4-10e0ee855d0e',
            fromName: 'Tester Mactestface',
            message: 'Hello world!',
            time: 1562630524000
          }
        }
      }
    ])
  })

  it('should handle creation of new chats', () => {
    const store = mockStore({
      account: {
        savedAvatars: [
          {
            avatarIdentifier: 'test@sl',
            dataSaveId: 'saveId'
          }
        ]
      },
      session: {
        agentId: 'e0f1adac-d250-4d71-b4e4-10e0ee855d0e',
        sessionId: 'b039f51f-41d9-41e7-a4b1-5490fbfd5eb9',
        avatarIdentifier: 'test@sl'
      },
      IMs: {},
      names: {
        names: {
          'f2373437-a2ef-4435-82b9-68d283538bb2': new AvatarName('Tester Furry')
        }
      }
    })

    uuid.mockReturnValueOnce('da4bf092-5e29-4577-a662-171bd57915f8')

    store.dispatch(startNewIMChat(
      IMChatType.personal,
      'f2373437-a2ef-4435-82b9-68d283538bb2',
      'Tester FuryTest'
    ))

    uuid.mockReturnValueOnce('5657e9ca-315c-47e3-bfde-7bfe2e5b7e25')

    store.dispatch(startNewIMChat(
      IMChatType.conference,
      'ee6af506-fa78-408d-869f-78305b3889c3',
      'Conference Chat 1234'
    ))

    expect(store.getActions()).toEqual([
      // Personal
      {
        type: 'im/create',
        payload: {
          _id: 'saveId/imChatsInfos/da4bf092-5e29-4577-a662-171bd57915f8',
          chatType: IMChatType.personal,
          sessionId: '12c6999b-70bf-0944-365d-78326dd6d6bc',
          saveId: 'da4bf092-5e29-4577-a662-171bd57915f8',
          target: 'f2373437-a2ef-4435-82b9-68d283538bb2',
          name: 'Tester Furry'
        }
      },
      {
        type: 'im/activateChat',
        payload: '12c6999b-70bf-0944-365d-78326dd6d6bc'
      },
      {
        type: 'session/changeChatTab',
        payload: '12c6999b-70bf-0944-365d-78326dd6d6bc'
      },

      // Conference
      {
        type: 'im/create',
        payload: {
          _id: 'saveId/imChatsInfos/5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
          chatType: IMChatType.conference,
          sessionId: 'ee6af506-fa78-408d-869f-78305b3889c3',
          saveId: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
          target: 'ee6af506-fa78-408d-869f-78305b3889c3',
          name: 'Conference Chat 1234'
        }
      },
      {
        type: 'im/activateChat',
        payload: 'ee6af506-fa78-408d-869f-78305b3889c3'
      },
      {
        type: 'session/changeChatTab',
        payload: 'ee6af506-fa78-408d-869f-78305b3889c3'
      }
    ])
  })
})

describe('incoming IM handling', () => {
  it('should send a retrieveInstantMessages packet', () => {
    const send = jest.fn()

    const store = configureMockStore([thunk.withExtraArgument({
      circuit: {
        send
      }
    })])({
      session: {
        agentId: 'f2373437-a2ef-4435-82b9-68d283538bb2',
        sessionId: 'e0f1adac-d250-4d71-b4e4-10e0ee855d0e'
      }
    })

    store.dispatch(retrieveInstantMessages())

    expect(send.mock.calls.length).toBe(1)
    expect(send.mock.calls[0]).toEqual([
      'RetrieveInstantMessages',
      {
        AgentData: [
          {
            AgentID: 'f2373437-a2ef-4435-82b9-68d283538bb2',
            SessionID: 'e0f1adac-d250-4d71-b4e4-10e0ee855d0e'
          }
        ]
      },
      true
    ])
  })

  it('should create a private chat and dispatch a private IM', () => {
    const messageData = createImPackage(IMDialog.MessageFromAgent)

    const store = mockStore(actions => {
      const state = {
        account: {
          savedAvatars: [
            {
              avatarIdentifier: 'Tester',
              dataSaveId: 'saveId'
            }
          ]
        },
        session: {
          avatarIdentifier: 'Tester'
        },
        groups: [],
        IMs: {}
      }

      if (actions.length >= 1) {
        // add new chat data to state
        state.IMs[messageData.MessageBlock[0].ID] = {
          _id: 'saveId/imChatsInfos/abcdef',
          saveId: 'abcdef'
        }
      }

      return state
    })

    uuid.mockReturnValueOnce('abcdef')

    store.dispatch(receiveIM(messageData))

    expect(store.getActions()).toEqual([
      {
        type: 'im/create',
        payload: {
          _id: 'saveId/imChatsInfos/abcdef',
          chatType: IMChatType.personal,
          sessionId: messageData.MessageBlock[0].ID,
          saveId: 'abcdef',
          target: messageData.AgentData[0].AgentID,
          name: 'Tester'
        }
      },
      {
        type: 'im/received',
        payload: {
          chatType: IMChatType.personal,
          session: messageData.MessageBlock[0].ID,
          msg: {
            _id: 'saveId/imChats/abcdef/2019-07-09T00:02:04.418Z',
            fromName: 'Tester',
            fromId: messageData.AgentData[0].AgentID,
            offline: 0,
            message: 'Hello World!',
            time: 1562630524418
          }
        }
      }
    ])
  })

  it("shouldn't create a new chat if a new message for it is received", () => {
    uuid.mockReturnValueOnce('abcdef')

    const messageData = createImPackage(IMDialog.MessageFromAgent)

    const store = mockStore({
      account: {
        savedAvatars: [
          {
            avatarIdentifier: 'Tester',
            dataSaveId: 'saveId'
          }
        ]
      },
      session: {
        avatarIdentifier: 'Tester'
      },
      groups: [],
      IMs: {
        [messageData.MessageBlock[0].ID]: {
          _id: 'saveId/imChatsInfos/abcdef',
          saveId: 'abcdef'
        }
      }
    })

    store.dispatch(receiveIM(messageData))

    expect(store.getActions()).toEqual([
      {
        type: 'im/received',
        payload: {
          chatType: IMChatType.personal,
          session: messageData.MessageBlock[0].ID,
          msg: {
            _id: 'saveId/imChats/abcdef/2019-07-09T00:02:04.418Z',
            fromName: 'Tester',
            fromId: messageData.AgentData[0].AgentID,
            offline: 0,
            message: 'Hello World!',
            time: 1562630524418
          }
        }
      }
    ])
  })

  it('should handle group sessions', () => {
    const groupId = 'a-group-id'

    const store = mockStore({
      account: {
        savedAvatars: [
          {
            avatarIdentifier: 'Tester',
            dataSaveId: 'saveId'
          }
        ]
      },
      session: {
        avatarIdentifier: 'Tester'
      },
      groups: [
        {
          id: groupId,
          name: 'A group has no name',
          sessionStarted: true
        }
      ],
      IMs: {
        [groupId]: {
          _id: 'saveId/imChatsInfos/abcdef',
          saveId: 'abcdef'
        }
      }
    })

    // IMDialog.MessageFromAgent but with fromGroup set to true
    store.dispatch(receiveIM(createImPackage(IMDialog.MessageFromAgent, {
      id: groupId,
      fromGroup: true,
      binaryBucket: 'A group has no name'
    })))

    // IMDialog.SessionSend
    store.dispatch(receiveIM(createImPackage(IMDialog.SessionSend, {
      id: groupId,
      binaryBucket: 'A group has no name'
    })))

    expect(store.getActions()).toEqual([
      {
        type: 'im/received',
        payload: {
          chatType: IMChatType.group,
          session: groupId,
          msg: {
            _id: 'saveId/imChats/abcdef/2019-07-09T00:02:04.418Z',
            fromName: 'Tester',
            fromId: '01234567-8900-0000-0000-000000000000',
            message: 'Hello World!',
            time: 1562630524418
          }
        }
      },
      {
        type: 'im/received',
        payload: {
          chatType: IMChatType.group,
          session: groupId,
          msg: {
            _id: 'saveId/imChats/abcdef/2019-07-09T00:02:04.418Z',
            fromName: 'Tester',
            fromId: '01234567-8900-0000-0000-000000000000',
            message: 'Hello World!',
            time: 1562630524418
          }
        }
      }
    ])
  })

  it('should receive and process session messages', () => {
    const id = 'a-session-id'

    const messageData = createImPackage(IMDialog.SessionSend, {
      id,
      binaryBucket: 'A conference'
    })

    const store = mockStore(actions => {
      const state = {
        account: {
          savedAvatars: [
            {
              avatarIdentifier: 'Tester',
              dataSaveId: 'saveId'
            }
          ]
        },
        session: {
          avatarIdentifier: 'Tester'
        },
        groups: [],
        IMs: {}
      }

      if (actions.length === 1 || actions.length === 3) {
        // add new chat data to state
        state.IMs[id] = {
          _id: 'saveId/imChatsInfos/' + id,
          saveId: 'abcdef'
        }
      }

      return state
    })

    uuid.mockReturnValueOnce('abcdef')

    // IMDialog.SessionSend
    store.dispatch(receiveIM(messageData))

    // IMDialog.MessageFromAgent with binaryBucket of length > 1
    store.dispatch(receiveIM(createImPackage(IMDialog.MessageFromAgent, {
      id,
      binaryBucket: 'A conference'
    })))

    const createAction = {
      type: 'im/create',
      payload: {
        _id: 'saveId/imChatsInfos/abcdef',
        chatType: IMChatType.conference,
        sessionId: id,
        saveId: 'abcdef',
        target: id,
        name: 'A conference'
      }
    }
    const messageAction = {
      type: 'im/received',
      payload: {
        chatType: IMChatType.conference,
        session: id,
        msg: {
          _id: 'saveId/imChats/abcdef/2019-07-09T00:02:04.418Z',
          fromName: 'Tester',
          fromId: '01234567-8900-0000-0000-000000000000',
          message: 'Hello World!',
          time: 1562630524418
        }
      }
    }

    expect(store.getActions()).toEqual([createAction, messageAction, createAction, messageAction])
  })

  it('should handle start and end typing events', () => {
    const store = mockStore()

    // IMDialog.StartTyping
    store.dispatch(receiveIM(createImPackage(IMDialog.StartTyping)))

    // IMDialog.StopTyping
    store.dispatch(receiveIM(createImPackage(IMDialog.StopTyping)))

    expect(store.getActions()).toEqual([
      {
        type: 'im/startedTyping',
        payload: {
          sessionId: '01234567-8900-0000-0000-009876543210',
          agentId: '01234567-8900-0000-0000-000000000000'
        }
      },
      {
        type: 'im/stoppedTyping',
        payload: {
          sessionId: '01234567-8900-0000-0000-009876543210',
          agentId: '01234567-8900-0000-0000-000000000000'
        }
      }
    ])
  })

  it('should handle busy auto responses', () => {
    const store = mockStore({
      account: {
        savedAvatars: [
          {
            avatarIdentifier: 'Tester',
            dataSaveId: 'saveId'
          }
        ]
      },
      session: {
        avatarIdentifier: 'Tester'
      },
      groups: [
        {
          id: 'some-none-existing-id'
        }
      ],
      IMs: {
        '01234567-8900-0000-0000-009876543210': {
          saveId: 'abcdef',
          sessionId: '01234567-8900-0000-0000-009876543210',
          type: IMChatType.personal
        },
        'some-none-existing-id': {
          saveId: 'something',
          sessionId: 'some-none-existing-id',
          type: IMChatType.group
        }
      }
    })

    store.dispatch(receiveIM(createImPackage(IMDialog.BusyAutoResponse, {
      message: "I'm sorry, but I'm busy ..."
    })))

    store.dispatch(receiveIM(createImPackage(IMDialog.BusyAutoResponse, {
      id: 'some-none-existing-id'
    })))

    store.dispatch(receiveIM(createImPackage(IMDialog.BusyAutoResponse, {
      id: 'group-id'
    })))

    expect(store.getActions()).toEqual([
      {
        type: 'im/received',
        payload: {
          chatType: IMChatType.personal,
          session: '01234567-8900-0000-0000-009876543210',
          msg: {
            _id: 'saveId/imChats/abcdef/2019-07-09T00:02:04.418Z',
            fromName: 'Tester',
            fromId: '01234567-8900-0000-0000-000000000000',
            offline: 0,
            message: "I'm sorry, but I'm busy ...",
            time: 1562630524418
          }
        }
      }
    ])
  })

  it('should handle system messages to IM chats', () => {
    const store = mockStore({
      account: {
        savedAvatars: [
          {
            avatarIdentifier: 'Tester',
            dataSaveId: 'saveId'
          }
        ]
      },
      session: {
        avatarIdentifier: 'Tester'
      },
      groups: [
        {
          id: 'some-none-existing-id'
        }
      ],
      IMs: {
        '01234567-8900-0000-0000-009876543210': {
          saveId: 'abcdef',
          sessionId: '01234567-8900-0000-0000-009876543210',
          type: IMChatType.personal
        },
        'some-none-existing-id': {
          saveId: 'something',
          sessionId: 'some-none-existing-id',
          type: IMChatType.group
        }
      }
    })

    store.dispatch(receiveIM(createImPackage(IMDialog.MessageFromAgent, {
      id: '01234567-8900-0000-0000-009876543210',
      fromAgentName: 'Second Life',
      message: 'User not online - message will be stored and delivered later.'
    })))

    expect(store.getActions()).toEqual([
      {
        type: 'SYSTEM_IM_RECEIVED',
        sessionId: '01234567-8900-0000-0000-009876543210',
        msg: {
          _id: 'saveId/imChats/abcdef/2019-07-09T00:02:04.418Z',
          fromName: 'Second Life',
          fromId: LLUUID.nil,
          offline: 0,
          message: 'User not online - message will be stored and delivered later.',
          time: 1562630524418
        }
      }
    ])
  })

  describe('notifications', () => {
    it('should handle text-only notifications', () => {
      const store = mockStore()

      // IMDialog.MessageBox
      store.dispatch(receiveIM(createImPackage(IMDialog.MessageBox, {
        message: 'An interesting message'
      })))

      // IMDialog.FromTaskAsAlert
      store.dispatch(receiveIM(createImPackage(IMDialog.FromTaskAsAlert)))

      // IMDialog.MessageFromAgent but with AgentID === '00000000-0000-0000-0000-000000000000'
      store.dispatch(receiveIM(createImPackage(IMDialog.MessageFromAgent, {
        agentId: LLUUID.nil,
        message: 'An interesting message'
      })))

      expect(store.getActions()).toEqual([
        {
          type: 'notifications/receive',
          payload: {
            notificationType: NotificationTypes.TextOnly,
            fromName: 'Tester',
            text: 'An interesting message'
          }
        },
        {
          type: 'notifications/receive',
          payload: {
            notificationType: NotificationTypes.TextOnly,
            fromName: 'Tester',
            text: 'Hello World!'
          }
        },
        {
          type: 'notifications/receive',
          payload: {
            notificationType: NotificationTypes.System,
            text: 'An interesting message'
          }
        }
      ])
    })

    it('should handle notifications in chat', () => {
      const store = mockStore({
        account: {
          savedAvatars: [
            {
              avatarIdentifier: 'Tester',
              dataSaveId: 'saveId'
            }
          ]
        },
        session: {
          avatarIdentifier: 'Tester'
        },
        groups: []
      })

      // IMDialog.MessageFromAgent with id === UUID.nil
      store.dispatch(receiveIM(createImPackage(IMDialog.MessageFromAgent, {
        id: LLUUID.nil
      })))

      expect(store.getActions()).toEqual([
        {
          type: 'localChat/notificationInChatAdded',
          payload: {
            text: 'Hello World!',
            fromName: 'Tester',
            fromId: '01234567-8900-0000-0000-000000000000',
            time: 1562630524418
          }
        }
      ])

      store.clearActions()

      // IMDialog.InventoryAccepted
      store.dispatch(receiveIM(createImPackage(IMDialog.InventoryAccepted)))

      // IMDialog.InventoryDeclined
      store.dispatch(receiveIM(createImPackage(IMDialog.InventoryDeclined)))

      expect(store.getActions()).toEqual([
        {
          type: 'localChat/notificationInChatAdded',
          payload: {
            text: 'accepted your inventory offer.',
            fromName: 'Tester',
            fromId: '01234567-8900-0000-0000-000000000000',
            time: 1562630524418
          }
        },
        {
          type: 'localChat/notificationInChatAdded',
          payload: {
            text: 'declined your inventory offer.',
            fromName: 'Tester',
            fromId: '01234567-8900-0000-0000-000000000000',
            time: 1562630524418
          }
        }
      ])

      store.clearActions()

      // IMDialog.FriendshipAccepted
      store.dispatch(receiveIM(createImPackage(IMDialog.FriendshipAccepted)))

      // IMDialog.FriendshipDeclined
      store.dispatch(receiveIM(createImPackage(IMDialog.FriendshipDeclined)))

      expect(store.getActions()).toEqual([
        {
          type: 'localChat/notificationInChatAdded',
          payload: {
            text: 'accepted your friendship offer.',
            fromName: 'Tester',
            fromId: '01234567-8900-0000-0000-000000000000',
            time: 1562630524418
          }
        },
        {
          type: 'localChat/notificationInChatAdded',
          payload: {
            text: 'declined your friendship offer.',
            fromName: 'Tester',
            fromId: '01234567-8900-0000-0000-000000000000',
            time: 1562630524418
          }
        }
      ])
    })

    it('should handle messages from objects', () => {
      const store = mockStore({
        IMs: {}
      })

      // IMDialog.MessageFromObject
      store.dispatch(receiveIM(createImPackage(IMDialog.MessageFromObject, {
        binaryBucket: Buffer.from('slurl://grid/x/y/z', 'ascii')
      })))

      // IMDialog.MessageFromAgent but with FromAgentName === 'Second Life'
      store.dispatch(receiveIM(createImPackage(IMDialog.MessageFromAgent, {
        fromAgentName: 'Second Life',
        binaryBucket: Buffer.from('slurl://grid/x/y/z', 'ascii')
      })))

      // IMDialog.FriendshipOffered but from FromAgentName === 'Second Life'
      store.dispatch(receiveIM(createImPackage(IMDialog.FriendshipOffered, {
        fromAgentName: 'Second Life',
        binaryBucket: Buffer.from('slurl://grid/x/y/z', 'ascii')
      })))

      expect(store.getActions()).toEqual([
        {
          type: 'NOTIFICATION_IN_CHAT_ADDED',
          text: 'Hello World!',
          fromName: 'Tester',
          ownerId: '01234567-8900-0000-0000-000000000000',
          objectId: '01234567-8900-0000-0000-009876543210',
          slurl: 'slurl://grid/x/y/z',
          time: 1562630524418
        },
        {
          type: 'NOTIFICATION_IN_CHAT_ADDED',
          text: 'Hello World!',
          fromName: 'Second Life',
          ownerId: '01234567-8900-0000-0000-000000000000',
          objectId: '01234567-8900-0000-0000-009876543210',
          slurl: 'slurl://grid/x/y/z',
          time: 1562630524418
        },
        {
          type: 'NOTIFICATION_IN_CHAT_ADDED',
          text: 'Hello World!',
          fromName: 'Second Life',
          ownerId: '01234567-8900-0000-0000-000000000000',
          objectId: '01234567-8900-0000-0000-009876543210',
          slurl: 'slurl://grid/x/y/z',
          time: 1562630524418
        }
      ])
    })

    it('should handle friendship offers', () => {
      const store = mockStore()

      store.dispatch(receiveIM(createImPackage(IMDialog.FriendshipOffered, {
        message: 'Friends?'
      })))

      expect(store.getActions()).toEqual([
        {
          type: 'notifications/receive',
          payload: {
            notificationType: NotificationTypes.FriendshipOffer,
            text: 'Friends?',
            fromId: '01234567-8900-0000-0000-000000000000',
            fromName: 'Tester',
            sessionId: '01234567-8900-0000-0000-009876543210'
          }
        }
      ])
    })

    it('should handle group invitations', () => {
      const store = mockStore()

      const binaryBucket = Buffer.alloc(4 + 16)
      binaryBucket.writeUInt32BE(1000, 0)
      for (let i = 0; i < 16; ++i) {
        binaryBucket.writeUInt8(i, i + 4)
      }

      store.dispatch(receiveIM(createImPackage(IMDialog.GroupInvitation, {
        id: 'an-id',
        fromGroup: true,
        binaryBucket
      })))

      expect(store.getActions()).toEqual([
        {
          type: 'notifications/receive',
          payload: {
            notificationType: NotificationTypes.GroupInvitation,
            text: 'Hello World!',
            fee: 1000,
            roleId: '00010203-0405-0607-0809-0a0b0c0d0e0f',
            groupId: '01234567-8900-0000-0000-000000000000',
            transactionId: 'an-id',
            name: 'Tester',
            useOfflineCap: false
          }
        }
      ])
    })

    it('should handle group notices', () => {
      const store = mockStore()

      const uuidArray = []
      for (let i = 0; i < 16; ++i) {
        uuidArray.push(i)
      }

      expect(() => {
        store.dispatch(receiveIM(createImPackage(IMDialog.GroupNotice, {
          message: 'Hello World!|Good news, everybody!',
          binaryBucket: Buffer.from([0, 0])
        })))
      }).toThrow('BinaryBucket of GroupNotice is to small!')
      store.clearActions()

      // Without item
      store.dispatch(receiveIM(createImPackage(IMDialog.GroupNotice, {
        message: 'Hello World!|Good news, everybody!',
        binaryBucket: Buffer.from([0, 0, ...uuidArray])
      })))

      expect(store.getActions()).toEqual([
        {
          type: 'notifications/receive',
          payload: {
            notificationType: NotificationTypes.GroupNotice,
            title: 'Hello World!',
            text: 'Good news, everybody!',
            groupId: '00010203-0405-0607-0809-0a0b0c0d0e0f',
            senderName: 'Tester',
            senderId: '01234567-8900-0000-0000-000000000000',
            time: 1562630524418,
            item: null
          }
        }
      ])

      store.clearActions()

      // With Item
      store.dispatch(receiveIM(createImPackage(IMDialog.GroupNotice, {
        message: 'Hello World!|Good news, everybody!',
        binaryBucket: Buffer.concat([
          Buffer.from([1, AssetType.ImageJPEG]),
          Buffer.from(uuidArray),
          createStringBuffer('Awesome Picture')
        ])
      })))

      expect(store.getActions()).toEqual([
        {
          type: 'notifications/receive',
          payload: {
            notificationType: NotificationTypes.GroupNotice,
            title: 'Hello World!',
            text: 'Good news, everybody!',
            groupId: '00010203-0405-0607-0809-0a0b0c0d0e0f',
            senderName: 'Tester',
            senderId: '01234567-8900-0000-0000-000000000000',
            time: 1562630524418,
            item: {
              name: 'Awesome Picture',
              type: AssetType.ImageJPEG,
              transactionId: '01234567-8900-0000-0000-009876543210'
            }
          }
        }
      ])
    })

    it('should handle goto URL notifications', () => {
      const store = mockStore()

      store.dispatch(receiveIM(createImPackage(IMDialog.GotoUrl, {
        binaryBucket: Buffer.from('http://wiki.secondlife.com/wiki/ImprovedInstantMessage')
      })))

      expect(store.getActions()).toEqual([
        {
          type: 'notifications/receive',
          payload: {
            notificationType: NotificationTypes.LoadURL,
            text: 'Hello World!',
            url: new window.URL('http://wiki.secondlife.com/wiki/ImprovedInstantMessage'),
            fromId: '01234567-8900-0000-0000-000000000000',
            fromName: 'Tester'
          }
        }
      ])
    })

    it('should handle a request teleport lure', () => {
      const store = mockStore()

      store.dispatch(receiveIM(createImPackage(IMDialog.RequestTeleportLure)))

      expect(store.getActions()).toEqual([
        {
          type: 'notifications/receive',
          payload: {
            notificationType: NotificationTypes.RequestTeleportLure,
            text: 'Hello World!',
            fromId: '01234567-8900-0000-0000-000000000000',
            fromName: 'Tester'
          }
        }
      ])
    })

    it('should handle a teleport lure', () => {
      const store = mockStore()

      /**
       * Create the binaryBucket
       * @param {number} gX SIM global X
       * @param {number} gY SIM global Y
       * @param {number} rX Region X
       * @param {number} rY Region Y
       * @param {number} rZ Region Z
       * @param {number} lX Lock at X
       * @param {number} lY Lock at Y
       * @param {number} lZ Lock at Z
       * @param {string?} maturity Age maturity. Can be 'PG', 'M' or 'A'
       * @returns {object} binary bucket
       */
      const createRegionInfo = (gX, gY, rX, rY, rZ, lX, lY, lZ, maturity = null) => {
        const coordinates = `${gX}|${gY}|${rX}|${rY}|${rZ}|${lX}|${lY}|${lZ}`

        return Buffer.from(['PG', 'M', 'A'].includes(maturity)
          ? coordinates + '|' + maturity
          : coordinates
        )
      }

      store.dispatch(receiveIM(createImPackage(IMDialog.TeleportLureOffered, {
        binaryBucket: createRegionInfo(42, 43, 128, 129, 130, 0, 1, 2)
      })))

      store.dispatch(receiveIM(createImPackage(IMDialog.TeleportLureOffered, {
        binaryBucket: createRegionInfo(42, 43, 128, 129, 130, 0, 1, 2, 'A')
      })))

      store.dispatch(receiveIM(createImPackage(IMDialog.GodLikeTeleportLureOffered, {
        binaryBucket: createRegionInfo(42, 43, 128, 129, 130, 0, 1, 2)
      })))

      expect(store.getActions()).toEqual([
        {
          type: 'notifications/receive',
          payload: {
            notificationType: NotificationTypes.TeleportLure,
            text: 'Hello World!',
            fromId: '01234567-8900-0000-0000-000000000000',
            fromName: 'Tester',
            lureId: '01234567-8900-0000-0000-009876543210',
            regionId: [42, 43], // TODO: Change to BigInt ((x << 32) | y)
            position: [128, 129, 130],
            lockAt: [0, 1, 2],
            maturity: Maturity.General,
            godLike: false
          }
        },
        {
          type: 'notifications/receive',
          payload: {
            notificationType: NotificationTypes.TeleportLure,
            text: 'Hello World!',
            fromId: '01234567-8900-0000-0000-000000000000',
            fromName: 'Tester',
            lureId: '01234567-8900-0000-0000-009876543210',
            regionId: [42, 43], // TODO: Change to BigInt ((x << 32) | y)
            position: [128, 129, 130],
            lockAt: [0, 1, 2],
            maturity: Maturity.Adult,
            godLike: false
          }
        },
        {
          type: 'notifications/receive',
          payload: {
            notificationType: NotificationTypes.TeleportLure,
            text: 'Hello World!',
            fromId: '01234567-8900-0000-0000-000000000000',
            fromName: 'Tester',
            lureId: '01234567-8900-0000-0000-009876543210',
            regionId: [42, 43], // TODO: Change to BigInt ((x << 32) | y)
            position: [128, 129, 130],
            lockAt: [0, 1, 2],
            maturity: Maturity.General,
            godLike: true
          }
        }
      ])
    })

    it('should handle inventory offers', () => {
      const store = mockStore()

      const uuidArray = []
      for (let i = 0; i < 16; ++i) {
        uuidArray.push(i)
      }

      store.dispatch(receiveIM(createImPackage(IMDialog.InventoryOffered, {
        binaryBucket: Buffer.from([AssetType.ImageJPEG, ...uuidArray])
      })))

      store.dispatch(receiveIM(createImPackage(IMDialog.TaskInventoryOffered, {
        binaryBucket: Buffer.from([AssetType.ImageJPEG])
      })))

      expect(store.getActions()).toEqual([
        {
          type: 'notifications/receive',
          payload: {
            notificationType: NotificationTypes.InventoryOffered,
            text: 'Hello World!',
            fromObject: false,
            fromGroup: false,
            fromId: '01234567-8900-0000-0000-000000000000',
            fromName: 'Tester',
            item: {
              objectId: '00010203-0405-0607-0809-0a0b0c0d0e0f',
              type: AssetType.ImageJPEG,
              transactionId: '01234567-8900-0000-0000-009876543210'
            }
          }
        },
        {
          type: 'notifications/receive',
          payload: {
            notificationType: NotificationTypes.InventoryOffered,
            text: 'Hello World!',
            fromObject: true,
            fromGroup: false,
            fromId: '01234567-8900-0000-0000-000000000000',
            fromName: 'Tester',
            item: {
              objectId: null,
              type: AssetType.ImageJPEG,
              transactionId: '01234567-8900-0000-0000-009876543210'
            }
          }
        }
      ])
    })
  })
})

// Helpers

function createStringBuffer (data) {
  return Buffer.concat([
    Buffer.from(data),
    typeof data === 'string' ? Buffer.from([0]) : Buffer.from([])
  ])
}

/**
 * Create a IM message/package.
 * @param {IMDialog}       dialog              Dialog the IM package should have.
 * @param {object}         data                Data that isn't the default value.
 * @param {string?}        data.id             SessionId. Is a UUID.
 * @param {string|Buffer?} data.message        Message body of the package.
 * @param {string?}        data.toAgentId      ID the message was send to.
 * @param {string?}        data.agentId        Id of the sender.
 * @param {string?}        data.sessionId      Id of the Grid Session.
 * @param {string|Buffer?} data.fromAgentName  Name of the sender.
 * @param {boolean?}       data.fromGroup      Is it from a group?
 * @param {number?}        data.offline        Was it a offline message?
 * @param {string|Buffer?} data.binaryBucket   Data in the binary bucket.
 * @param {number?}        data.parentEstateId Id of the estate it was send from.
 * @param {string?}        data.regionId       Id of the region it was send from.
 * @param {number[]?}      data.position       Position the message was send from.
 * @param {number?}        data.timestamp       Unix time stamp of when the message was send.
 */
function createImPackage (dialog, data = {}) {
  const getValue = (key, defaultValue) => {
    const value = data[key] || defaultValue
    return typeof value === 'string'
      ? createStringBuffer(value)
      : value
  }

  const fromAgentName = getValue('fromAgentName', 'Tester')
  const message = getValue('message', 'Hello World!')
  const bucket = getValue('binaryBucket', Buffer.from([]))

  return {
    AgentData: [
      {
        AgentID: data.agentId || '01234567-8900-0000-0000-000000000000',
        SessionID: data.sessionId || LLUUID.nil
      }
    ],
    MessageBlock: [
      {
        FromGroup: data.fromGroup || false,
        ToAgentID: data.toAgentId || '00000000-0000-0000-0000-009876543210',
        ParentEstateID: data.parentEstateId || 12,
        RegionID: data.regionId || '00000000-1234-5678-9000-000000000000',
        Position: data.position || [1.2, 3.4, 5.6],
        Offline: data.offline || 0,
        Dialog: dialog,
        ID: data.id || '01234567-8900-0000-0000-009876543210',
        Timestamp: data.timestamp || 0,
        FromAgentName: fromAgentName,
        Message: message,
        BinaryBucket: bucket
      }
    ]
  }
}
