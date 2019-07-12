import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { v4 as uuid } from 'uuid'
import mockdate from 'mockdate'

import { receiveIM } from './chatMessageActions'

import { IMDialog, NotificationTypes } from '../types/chat'

const mockStore = configureMockStore([thunk])

jest.mock('uuid')
mockdate.set(1562630524418)

describe('incoming IM handling', () => {
  test('it should create a private chat and dispatch a private IM', () => {
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

    uuid.mockReturnValue('abcdef')

    store.dispatch(receiveIM(messageData))

    expect(store.getActions()).toEqual([
      {
        type: 'CreateNewIMChat',
        _id: 'saveId/imChatsInfos/abcdef',
        chatType: 'personal',
        chatUUID: messageData.MessageBlock[0].ID,
        saveId: 'abcdef',
        target: messageData.AgentData[0].AgentID,
        name: 'Tester'
      },
      {
        type: 'PERSONAL_IM_RECEIVED',
        msg: {
          _id: 'saveId/imChats/abcdef/2019-07-09T00:02:04.418Z',
          chatUUID: messageData.MessageBlock[0].ID,
          fromAgentName: 'Tester',
          fromId: messageData.AgentData[0].AgentID,
          offline: 0,
          message: 'Hello World!',
          time: 1562630524418
        }
      }
    ])
  })

  it("shouldn't create a new chat if a new message for it is received", () => {
    uuid.mockReturnValue('abcdef')

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
        type: 'PERSONAL_IM_RECEIVED',
        msg: {
          _id: 'saveId/imChats/abcdef/2019-07-09T00:02:04.418Z',
          chatUUID: messageData.MessageBlock[0].ID,
          fromAgentName: 'Tester',
          fromId: messageData.AgentData[0].AgentID,
          offline: 0,
          message: 'Hello World!',
          time: 1562630524418
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
        type: 'GROUP_IM_RECEIVED',
        groupId,
        msg: {
          _id: 'saveId/imChats/abcdef/2019-07-09T00:02:04.418Z',
          fromAgentName: 'Tester',
          fromId: '01234567-8900-0000-0000-000000000000',
          message: 'Hello World!',
          time: 1562630524418
        }
      },
      {
        type: 'GROUP_IM_RECEIVED',
        groupId,
        msg: {
          _id: 'saveId/imChats/abcdef/2019-07-09T00:02:04.418Z',
          fromAgentName: 'Tester',
          fromId: '01234567-8900-0000-0000-000000000000',
          message: 'Hello World!',
          time: 1562630524418
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

    uuid.mockReturnValue('abcdef')

    // IMDialog.SessionSend
    store.dispatch(receiveIM(messageData))

    // IMDialog.MessageFromAgent with binaryBucket of length > 1
    store.dispatch(receiveIM(createImPackage(IMDialog.MessageFromAgent, {
      id,
      binaryBucket: 'A conference'
    })))

    const createAction = {
      type: 'CreateNewIMChat',
      _id: 'saveId/imChatsInfos/abcdef',
      chatType: 'conference',
      chatUUID: id,
      saveId: 'abcdef',
      target: id,
      name: 'A conference'
    }
    const messageAction = {
      type: 'CONFERENCE_IM_RECEIVED',
      conferenceId: id,
      msg: {
        _id: 'saveId/imChats/abcdef/2019-07-09T00:02:04.418Z',
        fromAgentName: 'Tester',
        fromId: '01234567-8900-0000-0000-000000000000',
        message: 'Hello World!',
        time: 1562630524418
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
        type: 'IM_START_TYPING',
        chatUUID: '01234567-8900-0000-0000-009876543210',
        agentId: '01234567-8900-0000-0000-000000000000'
      },
      {
        type: 'IM_STOP_TYPING',
        chatUUID: '01234567-8900-0000-0000-009876543210',
        agentId: '01234567-8900-0000-0000-000000000000'
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

      // IMDialog.MessageFromAgent but with AgentID === '00000000-0000-0000-0000-000000000000'
      store.dispatch(receiveIM(createImPackage(IMDialog.MessageFromAgent, {
        agentId: '00000000-0000-0000-0000-000000000000',
        message: 'An interesting message'
      })))

      const expectedAction = {
        type: 'NOTIFICATION_RECEIVED',
        msg: {
          notificationType: NotificationTypes.TextOnly,
          text: 'An interesting message'
        }
      }

      expect(store.getActions()).toEqual([expectedAction, expectedAction])
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

      // IMDialog.MessageFromAgent with id === UUID.zero
      store.dispatch(receiveIM(createImPackage(IMDialog.MessageFromAgent, {
        id: '00000000-0000-0000-0000-000000000000'
      })))

      // IMDialog.InventoryAccepted
      store.dispatch(receiveIM(createImPackage(IMDialog.InventoryAccepted)))

      // IMDialog.InventoryDeclined

      store.dispatch(receiveIM(createImPackage(IMDialog.InventoryDeclined)))

      expect(store.getActions()).toEqual([
        {
          type: 'NOTIFICATION_IN_CHAT_ADDED',
          text: 'Hello World!',
          fromName: 'Tester',
          fromId: '01234567-8900-0000-0000-000000000000',
          time: 1562630524418
        },
        {
          type: 'NOTIFICATION_IN_CHAT_ADDED',
          text: 'accepted your inventory offer.',
          fromName: 'Tester',
          fromId: '01234567-8900-0000-0000-000000000000',
          time: 1562630524418
        },
        {
          type: 'NOTIFICATION_IN_CHAT_ADDED',
          text: 'declined your inventory offer.',
          fromName: 'Tester',
          fromId: '01234567-8900-0000-0000-000000000000',
          time: 1562630524418
        }
      ])
    })

    it('should handle messages from objects', () => {
      const store = mockStore()

      // IMDialog.MessageFromObject
      store.dispatch(receiveIM(createImPackage(IMDialog.MessageFromObject)))

      // IMDialog.MessageFromAgent but with FromAgentName === 'Second Life'
      store.dispatch(receiveIM(createImPackage(IMDialog.MessageFromAgent, {
        fromAgentName: 'Second Life'
      })))

      // IMDialog.FriendshipOffered but from FromAgentName === 'Second Life'
      store.dispatch(receiveIM(createImPackage(IMDialog.FriendshipOffered, {
        fromAgentName: 'Second Life'
      })))

      expect(store.getActions()).toEqual([
        {
          type: 'NOTIFICATION_IN_CHAT_ADDED',
          text: 'Hello World!',
          fromName: 'Tester',
          fromId: '01234567-8900-0000-0000-009876543210',
          time: 1562630524418
        },
        {
          type: 'NOTIFICATION_IN_CHAT_ADDED',
          text: 'Hello World!',
          fromName: 'Second Life',
          fromId: '01234567-8900-0000-0000-009876543210',
          time: 1562630524418
        },
        {
          type: 'NOTIFICATION_IN_CHAT_ADDED',
          text: 'Hello World!',
          fromName: 'Second Life',
          fromId: '01234567-8900-0000-0000-009876543210',
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
          type: 'NOTIFICATION_RECEIVED',
          msg: {
            notificationType: NotificationTypes.FriendshipOffer,
            text: 'Friends?',
            fromId: '01234567-8900-0000-0000-000000000000',
            fromAgentName: 'Tester',
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
          type: 'NOTIFICATION_RECEIVED',
          msg: {
            notificationType: NotificationTypes.GroupInvitation,
            text: 'Hello World!',
            cost: 1000,
            roleId: '00010203-0405-4607-8809-0a0b0c0d0e0f',
            groupId: '01234567-8900-0000-0000-000000000000',
            transactionId: '01234567-8900-0000-0000-009876543210',
            name: 'Tester'
          }
        }
      ])
    })

    it('should handle goto URL notifications', () => {
      const store = mockStore()

      store.dispatch(receiveIM(createImPackage(IMDialog.GotoUrl, {
        binaryBucket: createStringBuffer('http://wiki.secondlife.com/wiki/ImprovedInstantMessage')
      })))

      expect(store.getActions()).toEqual([
        {
          type: 'NOTIFICATION_RECEIVED',
          msg: {
            notificationType: NotificationTypes.LoadURL,
            text: 'Hello World!',
            url: new window.URL('http://wiki.secondlife.com/wiki/ImprovedInstantMessage'),
            fromId: '01234567-8900-0000-0000-000000000000',
            fromAgentName: 'Tester'
          }
        }
      ])
    })

    it('should handle a request teleport lure', () => {
      const store = mockStore()

      store.dispatch(receiveIM(createImPackage(IMDialog.RequestTeleportLure)))

      expect(store.getActions()).toEqual([
        {
          type: 'NOTIFICATION_RECEIVED',
          msg: {
            notificationType: NotificationTypes.RequestTeleportLure,
            text: 'Hello World!',
            fromId: '01234567-8900-0000-0000-000000000000',
            fromAgentName: 'Tester'
          }
        }
      ])
    })

    it('should handle a teleport lure', () => {
      const store = mockStore()

      store.dispatch(receiveIM(createImPackage(IMDialog.TeleportLureOffered)))

      expect(store.getActions()).toEqual([
        {
          type: 'NOTIFICATION_RECEIVED',
          msg: {
            notificationType: NotificationTypes.TeleportLure,
            text: 'Hello World!',
            fromId: '01234567-8900-0000-0000-000000000000',
            fromAgentName: 'Tester',
            lureId: '01234567-8900-0000-0000-009876543210',
            regionId: '00000000-1234-5678-9000-000000000000',
            position: [1.2, 3.4, 5.6],
            regionInfo: '' // TODO: find out format of binaryBucket
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
        SessionID: data.sessionId || '00000000-0000-0000-0000-000000000000'
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
