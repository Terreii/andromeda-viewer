import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { v4 as uuid } from 'uuid'
import mockdate from 'mockdate'

import { receiveIM } from './chatMessageActions'

import { IMDialog } from '../types/chat'

const mockStore = configureMockStore([thunk])

jest.mock('uuid')
mockdate.set(1562630524418)

function createStringBuffer (data) {
  return Buffer.concat([
    Buffer.from(data),
    typeof data === 'string' ? Buffer.from([0]) : Buffer.from([])
  ])
}

describe('incoming IM handling', () => {
  test('it should create a private chat and dispatch a private IM', () => {
    const messageData = {
      AgentData: [
        {
          AgentID: '01234567-8900-0000-0000-000000000000',
          SessionID: '00000000-0000-0000-0000-000000000000'
        }
      ],
      MessageBlock: [
        {
          FromGroup: false,
          ToAgentID: '00000000-0000-0000-0000-009876543210',
          ParentEstateID: 12,
          RegionID: '00000000-1234-5678-9000-000000000000',
          Position: [1.2, 3.4, 5.6],
          Offline: 0,
          Dialog: IMDialog.MessageFromAgent,
          ID: '01234567-8900-0000-0000-009876543210',
          Timestamp: 0,
          FromAgentName: createStringBuffer('Tester'),
          Message: createStringBuffer('Hello World!'),
          BinaryBucket: Buffer.from([0])
        }
      ]
    }

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
})
