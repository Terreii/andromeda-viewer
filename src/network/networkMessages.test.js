/* eslint-env jest */

'use strict'

import * as messages from './networkMessages'
import * as types from './types'

global.describe('Messages', () => {
  global.describe('parseBody', () => {
    const buffer = Buffer.alloc(4 + (4 * (1 + (4 * 3))) + 1)
    buffer.writeUInt8(255, 0)
    buffer.writeUInt8(255, 1)
    buffer.writeUInt16BE(1, 2)

    const U32 = types.U32

    const testMessage = messages.parseBody(buffer)

    global.test('should return the TestMessage', () => {
      global.expect(testMessage instanceof messages.MessageProto).toBe(true)
      global.expect(testMessage instanceof messages.ReceivedMessage).toBe(true)
    })

    global.test('should have Blocks: TestBlock1 and NeighborBlock', () => {
      global.expect(typeof testMessage.TestBlock1).toBe('object')
      global.expect(testMessage.TestBlock1.name).toBe('TestBlock1')
      global.expect(typeof testMessage.NeighborBlock).toBe('object')
      global.expect(testMessage.NeighborBlock.name).toBe('NeighborBlock')
      global.expect(Array.isArray(testMessage.blocks)).toBe(true)
      global.expect(testMessage.blocks.length).toBe(2)
    })

    global.test('should have one U32 in an array in the TestBlock1', () => {
      global.expect(testMessage.TestBlock1.data.length).toBe(1)
      global.expect(testMessage.TestBlock1.data[0].Test1.name).toBe('Test1')
      global.expect(testMessage.TestBlock1.data[0].Test1.type).toBe('U32')
      global.expect(testMessage.TestBlock1.data[0].Test1 instanceof U32).toBe(true)
    })

    test('should have 3 U32 in 4 Arrays in NeighborBlock', () => {
      const block2 = testMessage.NeighborBlock
      expect(block2.data.length).toBe(4)
      expect(typeof block2.data[0].Test0).toBe('object')
      expect(typeof block2.data[0].Test1).toBe('object')
      expect(typeof block2.data[0].Test2).toBe('object')
      expect(block2.data[0].all.length).toBe(3)
      expect(block2.data[0].Test1.name).toBe('Test1')
      expect(block2.data[0].Test1 instanceof U32).toBe(true)

      expect(testMessage.getValue('NeighborBlock', 0, 'Test0')).toBe(0)
      expect(testMessage.getValue('NeighborBlock', 1, 'Test0')).toBe(0)
      expect(testMessage.getValue('NeighborBlock', 2, 'Test0')).toBe(0)
      expect(testMessage.getValue('NeighborBlock', 3, 'Test0')).toBe(0)
    })

    test('should return Strings for values', () => {
      expect(testMessage.getStringValue('TestBlock1', 'Test1')).toBe('0')
      expect(testMessage.getStringValue('NeighborBlock', 0, 'Test0')).toBe('0')
      expect(testMessage.getStringValue('NeighborBlock', 1, 'Test1')).toBe('0')
      expect(testMessage.getStringValue('NeighborBlock', 2, 'Test2')).toBe('0')
      expect(testMessage.getStringValue('NeighborBlock', 3, 'Test0')).toBe('0')
    })

    test('should map over block instances', () => {
      const data = testMessage.mapBlock('NeighborBlock', (getValue, index) => {
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
  })

  global.describe('createBody', () => {
    let buffer
    global.test('should create a Object with a Buffer out of a JSON like object',
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
        const obj = messages.createBody('TestMessage', testMessage)

        global.expect(obj.needsZeroencode).toBe(true)
        global.expect(obj.couldBeTrusted).toBe(false)
        global.expect(Buffer.isBuffer(obj.buffer)).toBe(true)
        buffer = obj.buffer
      })

    global.test('should have a length of 56 bytes', () => {
      global.expect(buffer.length).toBe(56)
    })

    global.test('should have the correct message number', () => {
      global.expect(buffer.readUInt16BE(0)).toBe(65535)
      global.expect(buffer.readUInt16BE(2)).toBe(1)
    })

    global.test('should store in TestBlock1 the correct value', () => {
      global.expect(buffer.readUInt32LE(4)).toBe(1337)
    })

    global.test('should store in NeighborBlock the correct values', done => {
      for (let i = 0; i < 12; i++) {
        global.expect(buffer.readUInt32LE(8 + (i * 4))).toBe(i)
      }
      done()
    })
  })
})
