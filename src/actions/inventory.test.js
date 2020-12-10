import {
  acceptInventoryOffer,
  declineInventoryOffer
} from './inventory'

import { createTestStore, AppState } from '../testUtils'

import { IMDialog } from '../types/chat'
import { AssetType } from '../types/inventory'

describe('inventory offers', () => {
  it('should handle accepting inventory offers from avatars', async () => {
    const { store, circuit, getDiff } = await createTestStore({ state: AppState.Connected })

    store.dispatch(acceptInventoryOffer(
      'f2373437-a2ef-4435-82b9-68d283538bb2',
      '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
      AssetType.Notecard,
      false,
      false
    ))

    expect(circuit.send).toHaveBeenCalledWith(
      'ImprovedInstantMessage',
      {
        AgentData: [
          {
            AgentID: '1ad4a264-c480-4322-a7e6-491e82450713',
            SessionID: 'a9795ee4-a246-4314-9925-c140f9a25629'
          }
        ],
        MessageBlock: [
          {
            FromAgentName: 'Andromedaviewertester Resident',
            ToAgentID: 'f2373437-a2ef-4435-82b9-68d283538bb2',
            ID: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
            Dialog: IMDialog.InventoryAccepted,
            Timestamp: Math.floor(Date.now() / 1000),
            BinaryBucket: [
              192,
              187,
              42,
              40,
              88,
              201,
              66,
              222,
              132,
              27,
              62,
              69,
              80,
              186,
              40,
              196
            ]
          }
        ]
      },
      true
    )
    expect(getDiff()).toEqual({})
  })

  it('should handle declining inventory offers from avatars', async () => {
    const { store, circuit, getDiff } = await createTestStore({ state: AppState.Connected })

    store.dispatch(declineInventoryOffer(
      'f2373437-a2ef-4435-82b9-68d283538bb2',
      '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
      false,
      false
    ))

    expect(circuit.send).toHaveBeenCalledWith(
      'ImprovedInstantMessage',
      {
        AgentData: [
          {
            AgentID: '1ad4a264-c480-4322-a7e6-491e82450713',
            SessionID: 'a9795ee4-a246-4314-9925-c140f9a25629'
          }
        ],
        MessageBlock: [
          {
            FromAgentName: 'Andromedaviewertester Resident',
            ToAgentID: 'f2373437-a2ef-4435-82b9-68d283538bb2',
            ID: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
            Dialog: IMDialog.InventoryDeclined,
            Timestamp: Math.floor(Date.now() / 1000),
            BinaryBucket: []
          }
        ]
      },
      true
    )
    expect(getDiff()).toEqual({})
  })

  it('should handle accepting inventory offers from group notices', async () => {
    const { store, circuit, getDiff } = await createTestStore({ state: AppState.Connected })

    store.dispatch(acceptInventoryOffer(
      'f2373437-a2ef-4435-82b9-68d283538bb2',
      '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
      AssetType.Notecard,
      true,
      false
    ))

    expect(circuit.send).toHaveBeenCalledWith(
      'ImprovedInstantMessage',
      {
        AgentData: [
          {
            AgentID: '1ad4a264-c480-4322-a7e6-491e82450713',
            SessionID: 'a9795ee4-a246-4314-9925-c140f9a25629'
          }
        ],
        MessageBlock: [
          {
            FromAgentName: 'Andromedaviewertester Resident',
            ToAgentID: 'f2373437-a2ef-4435-82b9-68d283538bb2',
            ID: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
            Dialog: IMDialog.GroupNoticeInventoryAccepted,
            Timestamp: Math.floor(Date.now() / 1000),
            BinaryBucket: [
              192,
              187,
              42,
              40,
              88,
              201,
              66,
              222,
              132,
              27,
              62,
              69,
              80,
              186,
              40,
              196
            ]
          }
        ]
      },
      true
    )
    expect(getDiff()).toEqual({})
  })

  it('should handle declining inventory offers from group notices', async () => {
    const { store, circuit, getDiff } = await createTestStore({ state: AppState.Connected })

    store.dispatch(declineInventoryOffer(
      'f2373437-a2ef-4435-82b9-68d283538bb2',
      '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
      true,
      false
    ))

    expect(circuit.send).toHaveBeenCalledWith(
      'ImprovedInstantMessage',
      {
        AgentData: [
          {
            AgentID: '1ad4a264-c480-4322-a7e6-491e82450713',
            SessionID: 'a9795ee4-a246-4314-9925-c140f9a25629'
          }
        ],
        MessageBlock: [
          {
            FromAgentName: 'Andromedaviewertester Resident',
            ToAgentID: 'f2373437-a2ef-4435-82b9-68d283538bb2',
            ID: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
            Dialog: IMDialog.GroupNoticeInventoryDeclined,
            Timestamp: Math.floor(Date.now() / 1000),
            BinaryBucket: []
          }
        ]
      },
      true
    )
    expect(getDiff()).toEqual({})
  })

  it('should handle accepting inventory offers from objects', async () => {
    const { store, circuit, getDiff } = await createTestStore({ state: AppState.Connected })

    store.dispatch(acceptInventoryOffer(
      'f2373437-a2ef-4435-82b9-68d283538bb2',
      '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
      AssetType.Notecard,
      false,
      true
    ))

    expect(circuit.send).toHaveBeenCalledWith(
      'ImprovedInstantMessage',
      {
        AgentData: [
          {
            AgentID: '1ad4a264-c480-4322-a7e6-491e82450713',
            SessionID: 'a9795ee4-a246-4314-9925-c140f9a25629'
          }
        ],
        MessageBlock: [
          {
            FromAgentName: 'Andromedaviewertester Resident',
            ToAgentID: 'f2373437-a2ef-4435-82b9-68d283538bb2',
            ID: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
            Dialog: IMDialog.TaskInventoryAccepted,
            Timestamp: Math.floor(Date.now() / 1000),
            BinaryBucket: [
              192,
              187,
              42,
              40,
              88,
              201,
              66,
              222,
              132,
              27,
              62,
              69,
              80,
              186,
              40,
              196
            ]
          }
        ]
      },
      true
    )
    expect(getDiff()).toEqual({})
  })

  it('should handle declining inventory offers from objects', async () => {
    const { store, circuit, getDiff } = await createTestStore({ state: AppState.Connected })

    store.dispatch(declineInventoryOffer(
      'f2373437-a2ef-4435-82b9-68d283538bb2',
      '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
      false,
      true
    ))

    expect(circuit.send).toHaveBeenCalledWith(
      'ImprovedInstantMessage',
      {
        AgentData: [
          {
            AgentID: '1ad4a264-c480-4322-a7e6-491e82450713',
            SessionID: 'a9795ee4-a246-4314-9925-c140f9a25629'
          }
        ],
        MessageBlock: [
          {
            FromAgentName: 'Andromedaviewertester Resident',
            ToAgentID: 'f2373437-a2ef-4435-82b9-68d283538bb2',
            ID: '5657e9ca-315c-47e3-bfde-7bfe2e5b7e25',
            Dialog: IMDialog.TaskInventoryDeclined,
            Timestamp: Math.floor(Date.now() / 1000),
            BinaryBucket: []
          }
        ]
      },
      true
    )
    expect(getDiff()).toEqual({})
  })
})
