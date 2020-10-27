import { v4 as uuid } from 'uuid'

import { parseBody, createBody } from './networkMessages'
import {
  getValueOf,
  getStringValueOf,
  getValuesOf,
  getStringValuesOf,
  getNumberOfBlockInstancesOf,
  mapBlockOf
} from './msgGetters'

describe('parseBody', () => {
  const buffer = Buffer.alloc(4 + (4 * (1 + (4 * 3))) + 1)
  buffer.writeUInt8(255, 0)
  buffer.writeUInt8(255, 1)
  buffer.writeUInt16BE(1, 2)

  const testMessage = parseBody(buffer, '127.0.0.1', 8080, true, true)

  it('should return the TestMessage', () => {
    expect(testMessage.constructor === Object).toBe(true)
    expect(testMessage.frequency).toBe('Low')
    expect(testMessage.number).toBe(1)
    expect(testMessage.name).toBe('TestMessage')
  })

  it('should include info of sender and package', () => {
    expect(testMessage.isReliable).toBe(true)
    expect(testMessage.isResend).toBe(true)
    expect(testMessage.from).toEqual({
      ip: '127.0.0.1',
      port: 8080
    })
  })

  it('should have one U32 in an array in the TestBlock1', () => {
    expect(getNumberOfBlockInstancesOf(testMessage, 'TestBlock1')).toBe(1)

    expect(getValueOf(testMessage, 'TestBlock1', 0, 'Test1')).toBe(0)
  })

  it('should have 3 U32 in 4 Arrays in NeighborBlock', () => {
    expect(getNumberOfBlockInstancesOf(testMessage, 'NeighborBlock')).toBe(4)

    const values = [
      'Test0',
      'Test1',
      'Test2'
    ]
    const shouldValues = {
      Test0: 0,
      Test1: 0,
      Test2: 0
    }

    expect(getValuesOf(testMessage, 'NeighborBlock', 0, values)).toEqual(shouldValues)
    expect(getValuesOf(testMessage, 'NeighborBlock', 1, values)).toEqual(shouldValues)
    expect(getValuesOf(testMessage, 'NeighborBlock', 2, values)).toEqual(shouldValues)
    expect(getValuesOf(testMessage, 'NeighborBlock', 3, values)).toEqual(shouldValues)
  })

  it('should return Strings for values', () => {
    expect(getStringValueOf(testMessage, 'TestBlock1', 'Test1')).toBe('0')
    expect(getStringValueOf(testMessage, 'NeighborBlock', 0, 'Test0')).toBe('0')
    expect(getStringValueOf(testMessage, 'NeighborBlock', 1, 'Test1')).toBe('0')
    expect(getStringValueOf(testMessage, 'NeighborBlock', 2, 'Test2')).toBe('0')
    expect(getStringValueOf(testMessage, 'NeighborBlock', 3, 'Test0')).toBe('0')
  })

  it('should map over block instances', () => {
    const data = mapBlockOf(testMessage, 'NeighborBlock', (getValue, index) => {
      return `${index} Test0 ${getValue('Test0')}`
    })
    expect(data).toEqual([
      '0 Test0 0',
      '1 Test0 0',
      '2 Test0 0',
      '3 Test0 0'
    ])
    expect(data).toHaveLength(4)
  })

  it('should get multiple values', () => {
    const data = getValuesOf(testMessage, 'NeighborBlock', 1, ['Test0', 'Test1', 'Test2'])
    const dataStr = getStringValuesOf(testMessage, 'NeighborBlock', ['Test0', 'Test1', 'Test2'])
    const data2 = getValuesOf(testMessage, 'NeighborBlock', [])

    expect(data).toEqual({
      Test0: 0,
      Test1: 0,
      Test2: 0
    })
    expect(data2).toEqual({
      Test0: 0,
      Test1: 0,
      Test2: 0
    })
    expect(dataStr).toEqual({
      Test0: '0',
      Test1: '0',
      Test2: '0'
    })
  })
})

describe('createBody', () => {
  let buffer
  it('should create a Object with a Buffer out of a JSON like object',
    () => {
      const testMessage = {
        TestBlock1: [
          {
            Test1: 1337
          }
        ],
        NeighborBlock: [
          {
            Test0: 0,
            Test1: 1,
            Test2: 2
          },
          {
            Test0: 3,
            Test1: 4,
            Test2: 5
          },
          {
            Test0: 6,
            Test1: 7,
            Test2: 8
          },
          {
            Test0: 9,
            Test1: 10,
            Test2: 11
          }
        ]
      }
      const obj = createBody('TestMessage', testMessage)

      expect(obj.needsZeroEncode).toBe(true)
      expect(obj.couldBeTrusted).toBe(false)
      expect(Buffer.isBuffer(obj.buffer)).toBe(true)
      buffer = obj.buffer
    })

  it('should have a length of 56 bytes', () => {
    expect(buffer.length).toBe(56)
  })

  it('should have the correct message number', () => {
    expect(buffer.readUInt16BE(0)).toBe(65535)
    expect(buffer.readUInt16BE(2)).toBe(1)
  })

  it('should store in TestBlock1 the correct value', () => {
    expect(buffer.readUInt32LE(4)).toBe(1337)
  })

  it('should store in NeighborBlock the correct values', done => {
    for (let i = 0; i < 12; i++) {
      expect(buffer.readUInt32LE(8 + (i * 4))).toBe(i)
    }
    done()
  })
})

describe('parseBody should work with buffer from createBody', () => {
  const aUUID = uuid()

  it('TestMessage', () => {
    const buffy = createBody('TestMessage', {
      TestBlock1: [
        {
          Test1: 1337
        }
      ],
      NeighborBlock: [
        {
          Test0: 0,
          Test1: 1,
          Test2: 2
        },
        {
          Test0: 3,
          Test1: 4,
          Test2: 5
        },
        {
          Test0: 6,
          Test1: 7,
          Test2: 8
        },
        {
          Test0: 9,
          Test1: 10,
          Test2: 11
        }
      ]
    })
    const parsedMessage = parseBody(buffy.buffer)

    expect(parsedMessage.name).toBe('TestMessage')
    expect(getValueOf(parsedMessage, 'TestBlock1', 'Test1')).toBe(1337)
    expect(getValueOf(parsedMessage, 'NeighborBlock', 3, 'Test2')).toBe(11)
  })

  it('NeighborList', () => {
    const buffy = createBody('NeighborList', {
      NeighborBlock: [
        {
          IP: '127.0.0.1',
          Port: 666,
          PublicIP: '0.0.0.1',
          PublicPort: 1337,
          RegionID: aUUID,
          Name: 'Hello Sim!',
          SimAccess: 13
        },
        {
          IP: '127.0.0.1',
          Port: 666,
          PublicIP: '0.0.0.1',
          PublicPort: 1337,
          RegionID: aUUID,
          Name: 'Hello Sim!',
          SimAccess: 13
        },
        {
          IP: '127.0.0.1',
          Port: 666,
          PublicIP: '0.0.0.1',
          PublicPort: 1337,
          RegionID: aUUID,
          Name: 'Hello Sim!',
          SimAccess: 13
        },
        {
          IP: '127.0.0.1',
          Port: 666,
          PublicIP: '0.0.0.1',
          PublicPort: 1337,
          RegionID: aUUID,
          Name: 'Hello Sim!',
          SimAccess: 13
        }
      ]
    })
    const parsedMessage = parseBody(buffy.buffer)

    expect(parsedMessage.name).toBe('NeighborList')
    expect(getValuesOf(parsedMessage, 'NeighborBlock', 0, [
      'IP',
      'Port',
      'RegionID',
      'SimAccess'
    ])).toEqual({
      IP: '127.0.0.1',
      Port: 666,
      RegionID: aUUID,
      SimAccess: 13
    })
    expect(getStringValueOf(parsedMessage, 'NeighborBlock', 'Name')).toBe('Hello Sim!')
  })

  it('ImprovedInstantMessage', () => {
    const now = Math.floor(Date.now() / 1000)
    const buffy = createBody('ImprovedInstantMessage', {
      AgentData: [
        {
          AgentID: aUUID,
          SessionID: aUUID
        }
      ],
      MessageBlock: [
        {
          FromGroup: false,
          ToAgentID: aUUID,
          ParentEstateID: 123456,
          RegionID: aUUID,
          Position: [1, 2.5, 5.25],
          Offline: 1,
          Dialog: 0,
          ID: aUUID,
          Timestamp: now,
          FromAgentName: 'Testy MacTestface',
          Message: 'Hello to my World of tests!',
          BinaryBucket: []
        }
      ]
    })
    const parsedMessage = parseBody(buffy.buffer)

    expect(parsedMessage.name).toBe('ImprovedInstantMessage')
    expect(getValuesOf(parsedMessage, 'AgentData', ['AgentID', 'SessionID'])).toEqual({
      AgentID: aUUID,
      SessionID: aUUID
    })
    expect(getStringValuesOf(parsedMessage, 'MessageBlock', ['FromAgentName', 'Message'])).toEqual({
      FromAgentName: 'Testy MacTestface',
      Message: 'Hello to my World of tests!'
    })
    expect(getValuesOf(parsedMessage, 'MessageBlock', [
      'FromGroup',
      'ToAgentID',
      'ParentEstateID',
      'RegionID',
      'Position',
      'Offline',
      'Dialog',
      'ID',
      'Timestamp',
      'BinaryBucket'
    ])).toEqual({
      FromGroup: false,
      ToAgentID: aUUID,
      ParentEstateID: 123456,
      RegionID: aUUID,
      Position: [1, 2.5, 5.25],
      Offline: 1,
      Dialog: 0,
      ID: aUUID,
      Timestamp: now,
      BinaryBucket: Buffer.from([])
    })
  })
})
