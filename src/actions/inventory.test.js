import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
  acceptInventoryOffer,
  declineInventoryOffer
} from './inventory'
import AvatarName from '../avatarName'

import { IMDialog } from '../types/chat'
import { AssetType } from '../types/inventory'

describe('inventory offers', () => {
  it('should handle offers from avatars', () => {
    const send = jest.fn(() => Promise.resolve())

    const store = configureMockStore([thunk.withExtraArgument({
      circuit: { send }
    })])(getState())

    store.dispatch(acceptInventoryOffer(
      'f2373437-a2ef-4435-82b9-68d283538bb2',
      '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
      AssetType.Notecard,
      false,
      false
    ))

    store.dispatch(declineInventoryOffer(
      'f2373437-a2ef-4435-82b9-68d283538bb2',
      '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
      false,
      false
    ))

    expect(send.mock.calls.length).toBe(2)

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
            FromAgentName: 'Tester Avatar',
            ToAgentID: 'f2373437-a2ef-4435-82b9-68d283538bb2',
            ID: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
            Dialog: IMDialog.InventoryAccepted,
            Timestamp: Math.floor(Date.now() / 1000),
            BinaryBucket: [
              224,
              241,
              173,
              172,
              210,
              80,
              77,
              113,
              180,
              228,
              16,
              224,
              238,
              133,
              93,
              14
            ]
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
            FromAgentName: 'Tester Avatar',
            ToAgentID: 'f2373437-a2ef-4435-82b9-68d283538bb2',
            ID: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
            Dialog: IMDialog.InventoryDeclined,
            Timestamp: Math.floor(Date.now() / 1000),
            BinaryBucket: []
          }
        ]
      },
      true
    ])
  })

  it('should handle offers from group notices', () => {
    const send = jest.fn(() => Promise.resolve())

    const store = configureMockStore([thunk.withExtraArgument({
      circuit: { send }
    })])(getState())

    store.dispatch(acceptInventoryOffer(
      'f2373437-a2ef-4435-82b9-68d283538bb2',
      '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
      AssetType.Notecard,
      true,
      false
    ))

    store.dispatch(declineInventoryOffer(
      'f2373437-a2ef-4435-82b9-68d283538bb2',
      '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
      true,
      false
    ))

    expect(send.mock.calls.length).toBe(2)

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
            FromAgentName: 'Tester Avatar',
            ToAgentID: 'f2373437-a2ef-4435-82b9-68d283538bb2',
            ID: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
            Dialog: IMDialog.GroupNoticeInventoryAccepted,
            Timestamp: Math.floor(Date.now() / 1000),
            BinaryBucket: [
              224,
              241,
              173,
              172,
              210,
              80,
              77,
              113,
              180,
              228,
              16,
              224,
              238,
              133,
              93,
              14
            ]
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
            FromAgentName: 'Tester Avatar',
            ToAgentID: 'f2373437-a2ef-4435-82b9-68d283538bb2',
            ID: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
            Dialog: IMDialog.GroupNoticeInventoryDeclined,
            Timestamp: Math.floor(Date.now() / 1000),
            BinaryBucket: []
          }
        ]
      },
      true
    ])
  })

  it('should handle offers from objects', () => {
    const send = jest.fn(() => Promise.resolve())

    const store = configureMockStore([thunk.withExtraArgument({
      circuit: { send }
    })])(getState())

    store.dispatch(acceptInventoryOffer(
      'f2373437-a2ef-4435-82b9-68d283538bb2',
      '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
      AssetType.Notecard,
      false,
      true
    ))

    store.dispatch(declineInventoryOffer(
      'f2373437-a2ef-4435-82b9-68d283538bb2',
      '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
      false,
      true
    ))

    expect(send.mock.calls.length).toBe(2)

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
            FromAgentName: 'Tester Avatar',
            ToAgentID: 'f2373437-a2ef-4435-82b9-68d283538bb2',
            ID: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
            Dialog: IMDialog.TaskInventoryAccepted,
            Timestamp: Math.floor(Date.now() / 1000),
            BinaryBucket: [
              224,
              241,
              173,
              172,
              210,
              80,
              77,
              113,
              180,
              228,
              16,
              224,
              238,
              133,
              93,
              14
            ]
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
            FromAgentName: 'Tester Avatar',
            ToAgentID: 'f2373437-a2ef-4435-82b9-68d283538bb2',
            ID: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
            Dialog: IMDialog.TaskInventoryDeclined,
            Timestamp: Math.floor(Date.now() / 1000),
            BinaryBucket: []
          }
        ]
      },
      true
    ])
  })

  function getState () {
    return {
      account: {
        savedAvatars: [
          {
            avatarIdentifier: 'Tester',
            dataSaveId: 'saveId'
          }
        ]
      },
      session: {
        avatarIdentifier: 'Tester',
        agentId: 'e0f1adac-d250-4d71-b4e4-10e0ee855d0e',
        sessionId: 'b039f51f-41d9-41e7-a4b1-5490fbfd5eb9'
      },
      names: {
        names: { 'e0f1adac-d250-4d71-b4e4-10e0ee855d0e': new AvatarName('Tester Avatar') }
      },
      inventory: {
        root: '1',
        folders: new Map([
          [
            '1',
            {
              folderId: 'e0f1adac-d250-4d71-b4e4-10e0ee855d0e',
              children: ['2', '3'],
              typeDefault: AssetType.Folder
            }
          ],
          [
            '2',
            {
              folderId: 'e0f1adac-d250-4d71-b4e4-10e0ee855d0e',
              children: [],
              typeDefault: AssetType.Object
            }
          ],
          [
            '3',
            {
              folderId: 'e0f1adac-d250-4d71-b4e4-10e0ee855d0e',
              children: [],
              typeDefault: AssetType.Notecard
            }
          ]
        ])
      }
    }
  }
})
