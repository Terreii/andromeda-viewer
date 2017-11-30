'use strict'

import uuid from 'uuid'

import * as messages from './networkMessages'

global.describe('types', () => {
  global.describe('Null', function () {
    const Null = new messages.types.Null()

    global.test('should have a size of 0', () => {
      global.expect(Null.size).toBe(0)
    })

    global.test('should hava a value of null', () => {
      global.expect(Null.value).toBeNull()
    })
  })

  global.describe('Fixed', () => {
    const size = Math.floor(Math.random() * 20) + 1
    const array = []
    for (let i = 0; i < size + 50; i++) {
      array.push(i)
    }
    const buffer = messages.types.Fixed.createBuffer(array, size + 2)
    const fixed = new messages.types.Fixed(buffer, 2, 'name', size)

    global.test(`should have the size of ${size}`, () => {
      global.expect(fixed.size).toBe(size)
    })
    global.test('should have a buffer as value with the size of ' + size, () => {
      global.expect(fixed.value.length).toBe(size)
    })
    global.test('should have a buffer with 2 at index 0', () => {
      global.expect(fixed.value.readUInt8(0)).toBe(2)
    })
  })

  global.describe('Variable1', () => {
    const size = Math.floor(Math.random() * 20) + 1
    const array = []
    for (let i = 1; i <= size; i++) {
      array.push(i)
    }
    const buffer = messages.types.Variable1.createBuffer(array)
    const variable = new messages.types.Variable1(buffer, 0)

    global.test('should have a size of ' + size, () => {
      global.expect(variable.size).toBe(size)
    })
    global.test('should have a buffer as value with the size of ' + size, () => {
      global.expect(variable.value.length).toBe(size)
    })
    global.test('should have a buffer with 1 at index 0', () => {
      global.expect(variable.value.readUInt8(0)).toBe(1)
    })
    global.test('should throw an error if non array like structures are given to ' +
      'createBuffer', () => {
      try {
        let test = messages.types.Variable1.createBuffer({'0': 2})
        test = messages.types.Variable1.createBuffer({length: 256})
        global.expect(test).toBeNull()
      } catch (e) {
        global.expect(true).toBe(true)
      }
    })
  })

  global.describe('Variable2', () => {
    const size = Math.floor(Math.random() * 20) + 1
    const array = []
    for (let i = 1; i <= size; i++) {
      array.push(i)
    }
    const buffer = messages.types.Variable2.createBuffer(array)
    const variable = new messages.types.Variable2(buffer, 0)

    global.test('should have a size of ' + size, () => {
      global.expect(variable.size).toBe(size)
    })
    global.test('should have a buffer as value with the size of ' + size, () => {
      global.expect(variable.value.length).toBe(size)
    })
    global.test('should have a buffer with 1 at index 0', () => {
      global.expect(variable.value.readUInt8(0)).toBe(1)
    })
    global.test('should throw an error if non array like structures are given to ' +
      'createBuffer', () => {
      try {
        let test = messages.types.Variable1.createBuffer({'0': 2})
        test = messages.types.Variable1.createBuffer({length: 65536})
        global.expect(test).toBeNull()
      } catch (e) {
        global.expect(true).toBe(true)
      }
    })
  })

  global.describe('Numbers', () => {
    const posBuffer = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8])
    const negBuffer = Buffer.from([-1, -2, -3, -4, -5, -6, -7, -8])
    global.test('U8 should have the unsigned value of the given position', () => {
      const offset = Math.floor(Math.random() * 8)

      global.expect(new messages.types.U8(posBuffer, offset).value)
        .toBe(posBuffer.readUInt8(offset))
      global.expect(new messages.types.U8(negBuffer, offset).value)
        .toBe(negBuffer.readUInt8(offset))
      global.expect(messages.types.U8.createBuffer(3)).toEqual(Buffer.from([3]))
    })

    global.test('U16 should have the unsigned value of the given position', () => {
      const offset = Math.floor(Math.random() * 4)
      global.expect(new messages.types.U16(posBuffer, offset).value)
        .toBe(posBuffer.readUInt16LE(offset))
      global.expect(new messages.types.U16(negBuffer, offset).value)
        .toBe(negBuffer.readUInt16LE(offset))
      global.expect(messages.types.U16.createBuffer(3)).toEqual(Buffer.from([3, 0]))
    })

    global.test('U32 should have the unsigned value of the given position', () => {
      const offset = Math.floor(Math.random() * 2)

      global.expect(new messages.types.U32(posBuffer, offset).value)
        .toBe(posBuffer.readUInt32LE(offset))
      global.expect(new messages.types.U32(negBuffer, offset).value)
        .toBe(negBuffer.readUInt32LE(offset))
      global.expect(messages.types.U32.createBuffer(3))
        .toEqual(Buffer.from([3, 0, 0, 0]))
    })

    global.test('S8 should have the signed value of the given position', () => {
      const offset = Math.floor(Math.random() * 8)

      global.expect(new messages.types.S8(posBuffer, offset).value)
        .toBe(posBuffer.readInt8(offset))
      global.expect(new messages.types.S8(negBuffer, offset).value)
        .toBe(negBuffer.readInt8(offset))
      global.expect(messages.types.S8.createBuffer(-3))
        .toEqual(Buffer.from([-3]))
    })

    global.test('S16 should have the signed value of the given position', () => {
      const offset = Math.floor(Math.random() * 4)

      global.expect(new messages.types.S16(posBuffer, offset).value)
        .toBe(posBuffer.readInt16LE(offset))
      global.expect(new messages.types.S16(negBuffer, offset).value)
        .toBe(negBuffer.readInt16LE(offset))
      global.expect(messages.types.S16.createBuffer(-3))
        .toEqual(Buffer.from([-3, 255]))
    })

    global.test('S32 should have the signed value of the given position', () => {
      const offset = Math.floor(Math.random() * 2)

      global.expect(new messages.types.S32(posBuffer, offset).value)
        .toBe(posBuffer.readInt32LE(offset))
      global.expect(new messages.types.S32(negBuffer, offset).value)
        .toBe(negBuffer.readInt32LE(offset))
      global.expect(messages.types.S32.createBuffer(-3))
        .toEqual(Buffer.from([-3, 255, 255, 255]))
    })

    global.test('F32 should have the value of the given position', () => {
      const buffer = Buffer.alloc(8)
      const value = Math.random()
      buffer.writeFloatLE(value, 4)

      global.expect(new messages.types.F32(buffer, 4).value)
        .toBe(buffer.readFloatLE(4))
      global.expect(messages.types.F32.createBuffer(value))
        .toEqual(buffer.slice(4))
    })

    global.test('F64 should have the value of the given position', () => {
      const buffer = Buffer.alloc(8)
      const value = Math.random()
      buffer.writeDoubleLE(value, 0)

      global.expect(new messages.types.F64(buffer, 0).value)
        .toBe(buffer.readDoubleLE(0))
      global.expect(messages.types.F64.createBuffer(value)).toEqual(buffer)
    })
  })

  global.describe('Vectors', () => {
    global.test('LLVector3 should store a array of 3 floats', () => {
      const buffer = Buffer.alloc(4 * 4)
      ;[1.1, 2.2, 3.3, 4.4].forEach((num, i) => {
        buffer.writeFloatLE(num, i * 4)
      })

      global.expect(new messages.types.LLVector3(buffer, 4).value).toEqual([
        buffer.readFloatLE(4),
        buffer.readFloatLE(8),
        buffer.readFloatLE(12)
      ])
      global.expect(messages.types.LLVector3.createBuffer([2.2, 3.3, 4.4]))
        .toEqual(buffer.slice(4))
    })

    global.test('LLVector3d should store a array of 3 floats', () => {
      const buffer = Buffer.alloc(4 * 8)
      const array = [1.1, 2.2, 3.3, 4.4]
      array.forEach((num, i) => buffer.writeDoubleLE(num, i * 8))

      global.expect(new messages.types.LLVector3d(buffer, 8).value).toEqual([
        buffer.readDoubleLE(8),
        buffer.readDoubleLE(16),
        buffer.readDoubleLE(24)
      ])
      global.expect(messages.types.LLVector3d.createBuffer(array.slice(1)))
        .toEqual(buffer.slice(8))
    })

    global.test('LLVector4 should store a array of 3 floats', () => {
      const buffer = Buffer.alloc(5 * 4)
      const array = [1.1, 2.2, 3.3, 4.4, 5.5]
      array.forEach((num, i) => buffer.writeFloatLE(num, i * 4))

      global.expect(new messages.types.LLVector4(buffer, 4).value).toEqual([
        buffer.readFloatLE(4),
        buffer.readFloatLE(8),
        buffer.readFloatLE(12),
        buffer.readFloatLE(16)
      ])
      global.expect(messages.types.LLVector4.createBuffer(array.slice(1)))
        .toEqual(buffer.slice(4))
    })

    global.test('LLQuaternion should store a array of 3 floats', () => {
      const buffer = Buffer.alloc(4 * 4)
      ;[1.1, 2.2, 3.3, 4.4].forEach((num, i) => {
        buffer.writeFloatLE(num, i * 4)
      })
      global.expect(new messages.types.LLQuaternion(buffer, 4).value).toEqual([
        buffer.readFloatLE(4),
        buffer.readFloatLE(8),
        buffer.readFloatLE(12)
      ])
      global.expect(messages.types.LLQuaternion.createBuffer([2.2, 3.3, 4.4]))
        .toEqual(buffer.slice(4))
    })
  })

  global.describe('LLUUID', () => {
    global.test('should store a valid UUID', () => {
      const buffer = Buffer.alloc(16)
      uuid.v4(null, buffer)
      const idString = new messages.types.LLUUID(buffer, 0).value

      global.expect(messages.types.LLUUID.createBuffer(idString)).toEqual(buffer)
    })
  })

  global.describe('BOOL', () => {
    global.test('should store either a true or a false', () => {
      const buffer = Buffer.from([0, 1])

      global.expect(new messages.types.BOOL(buffer, 0).value).toBe(false)
      global.expect(new messages.types.BOOL(buffer, 1).value).toBe(true)
      global.expect(messages.types.BOOL.createBuffer(true)[0]).toBe(1)
      global.expect(messages.types.BOOL.createBuffer(false)[0]).toBe(0)
    })
  })

  global.describe('IPADDR & IPPORT', () => {
    const ipAddress = [
      // IP
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      // Port
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255)
    ]
    const buffer = Buffer.from(ipAddress)
    // IP RegExp
    const reg = new RegExp('^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).)' +
      '{3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$')

    global.test('should parse a valid ip-address', () => {
      global.expect(reg.test(new messages.types.IPADDR(buffer, 0).value))
        .toBe(true)
    })

    global.test('should parse a valid ip-port', () => {
      global.expect(new messages.types.IPPORT(buffer, 4).value)
        .toBe(buffer.readUInt16LE(4))
    })

    global.test('should create valid buffers', () => {
      const addr = Buffer.from([1, 2, 3, 4])
      global.expect(messages.types.IPADDR.createBuffer('1.2.3.4')).toEqual(addr)
      global.expect(messages.types.IPADDR.createBuffer([1, 2, 3, 4])).toEqual(addr)
      const port = Buffer.from([136, 19])
      global.expect(messages.types.IPPORT.createBuffer(5000)).toEqual(port)
    })
  })
})

global.describe('Messages', () => {
  global.describe('parseBody', () => {
    const buffer = Buffer.alloc(4 + (4 * (1 + (4 * 3))) + 1)
    buffer.writeUInt8(255, 0)
    buffer.writeUInt8(255, 1)
    buffer.writeUInt16BE(1, 2)

    const U32 = messages.types.U32

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

    global.test('should have 3 U32 in 4 Arrays in NeighborBlock', () => {
      const block2 = testMessage.NeighborBlock
      global.expect(block2.data.length).toBe(4)
      global.expect(typeof block2.data[0].Test0).toBe('object')
      global.expect(typeof block2.data[0].Test1).toBe('object')
      global.expect(typeof block2.data[0].Test2).toBe('object')
      global.expect(block2.data[0].all.length).toBe(3)
      global.expect(block2.data[0].Test1.name).toBe('Test1')
      global.expect(block2.data[0].Test1 instanceof U32).toBe(true)
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

        global.expect(obj.needsZeroEncode).toBe(true)
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
