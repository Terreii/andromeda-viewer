'use strict'

import {describe, it} from 'mocha'
import assert from 'assert'

import uuid from 'uuid'

const messages = require('../builds/testBundle')

describe('networkMessages', () => {
  describe('types', () => {
    describe('Null', function () {
      const Null = new messages.types.Null()
      it('should have a size of 0', () => {
        assert.equal(0, Null.size)
      })
      it('should hava a value of null', () => {
        assert.strictEqual(null, Null.value)
      })
    })

    describe('Fixed', () => {
      const size = Math.floor(Math.random() * 20) + 1
      const array = []
      for (let i = 0; i < size + 50; i++) {
        array.push(i)
      }
      const buffer = messages.types.Fixed.createBuffer(array, size + 2)
      const fixed = new messages.types.Fixed(buffer, 2, 'name', size)
      it(`should have the size of ${size}`,
        () => assert.equal(size, fixed.size))
      it('should have a buffer as value with the size of ' + size, () => {
        assert.equal(size, fixed.value.length)
      })
      it('should have a buffer with 2 at index 0', () => {
        assert.equal(2, fixed.value.readUInt8(0))
      })
    })

    describe('Variable1', () => {
      const size = Math.floor(Math.random() * 20) + 1
      const array = []
      for (let i = 1; i <= size; i++) {
        array.push(i)
      }
      const buffer = messages.types.Variable1.createBuffer(array)
      const variable = new messages.types.Variable1(buffer, 0)
      it('should have a size of ' + size, () => {
        assert.equal(size, variable.size)
      })
      it('should have a buffer as value with the size of ' + size, () => {
        assert.equal(size, variable.value.length)
      })
      it('should have a buffer with 1 at index 0', () => {
        assert.equal(1, variable.value.readUInt8(0))
      })
      it('should throw an error if non array like structures are given to ' +
        'createBuffer', () => {
        try {
          let test = messages.types.Variable1.createBuffer({'0': 2})
          test = messages.types.Variable1.createBuffer({length: 256})
          assert.equal(null, test)
        } catch (e) {
          assert.equal(true, true)
        }
      })
    })

    describe('Variable2', () => {
      const size = Math.floor(Math.random() * 20) + 1
      const array = []
      for (let i = 1; i <= size; i++) {
        array.push(i)
      }
      const buffer = messages.types.Variable2.createBuffer(array)
      const variable = new messages.types.Variable2(buffer, 0)
      it('should have a size of ' + size, () => {
        assert.equal(size, variable.size)
      })
      it('should have a buffer as value with the size of ' + size, () => {
        assert.equal(size, variable.value.length)
      })
      it('should have a buffer with 1 at index 0', () => {
        assert.equal(1, variable.value.readUInt8(0))
      })
      it('should throw an error if non array like structures are given to ' +
        'createBuffer', () => {
        try {
          let test = messages.types.Variable1.createBuffer({'0': 2})
          test = messages.types.Variable1.createBuffer({length: 65536})
          assert.equal(null, test)
        } catch (e) {
          assert.equal(true, true)
        }
      })
    })

    describe('Numbers', () => {
      const posBuffer = new Buffer([1, 2, 3, 4, 5, 6, 7, 8])
      const negBuffer = new Buffer([-1, -2, -3, -4, -5, -6, -7, -8])
      it('U8 should have the unsigned value of the given position', () => {
        const offset = Math.floor(Math.random() * 8)
        assert.equal(posBuffer.readUInt8(offset),
          new messages.types.U8(posBuffer, offset).value)
        assert.equal(negBuffer.readUInt8(offset),
          new messages.types.U8(negBuffer, offset).value)
        assert.deepEqual(new Buffer([3]), messages.types.U8.createBuffer(3))
      })

      it('U16 should have the unsigned value of the given position', () => {
        const offset = Math.floor(Math.random() * 4)
        assert.equal(posBuffer.readUInt16LE(offset),
          new messages.types.U16(posBuffer, offset).value)
        assert.equal(negBuffer.readUInt16LE(offset),
          new messages.types.U16(negBuffer, offset).value)
        var buffy = new Buffer([3, 0])
        assert.deepEqual(buffy, messages.types.U16.createBuffer(3))
      })

      it('U32 should have the unsigned value of the given position', () => {
        const offset = Math.floor(Math.random() * 2)
        assert.equal(posBuffer.readUInt32LE(offset),
          new messages.types.U32(posBuffer, offset).value)
        assert.equal(negBuffer.readUInt32LE(offset),
          new messages.types.U32(negBuffer, offset).value)
        var buffy = new Buffer([3, 0, 0, 0])
        assert.deepEqual(buffy, messages.types.U32.createBuffer(3))
      })

      it('S8 should have the signed value of the given position', () => {
        const offset = Math.floor(Math.random() * 8)
        assert.equal(posBuffer.readInt8(offset),
          new messages.types.S8(posBuffer, offset).value)
        assert.equal(negBuffer.readInt8(offset),
          new messages.types.S8(negBuffer, offset).value)
        assert.deepEqual(new Buffer([-3]), messages.types.S8.createBuffer(-3))
      })

      it('S16 should have the signed value of the given position', () => {
        const offset = Math.floor(Math.random() * 4)
        assert.equal(posBuffer.readInt16LE(offset),
          new messages.types.S16(posBuffer, offset).value)
        assert.equal(negBuffer.readInt16LE(offset),
          new messages.types.S16(negBuffer, offset).value)
        const buffy = new Buffer([-3, 255])
        assert.deepEqual(buffy, messages.types.S16.createBuffer(-3))
      })

      it('S32 should have the signed value of the given position', () => {
        const offset = Math.floor(Math.random() * 2)
        assert.equal(posBuffer.readInt32LE(offset),
          new messages.types.S32(posBuffer, offset).value)
        assert.equal(negBuffer.readInt32LE(offset),
          new messages.types.S32(negBuffer, offset).value)
        const buffy = new Buffer([-3, 255, 255, 255])
        assert.deepEqual(buffy, messages.types.S32.createBuffer(-3))
      })

      it('F32 should have the value of the given position', () => {
        const buffer = new Buffer(8)
        const value = Math.random()
        buffer.writeFloatLE(value, 4)
        assert.equal(buffer.readFloatLE(4),
          new messages.types.F32(buffer, 4).value)
        assert.deepEqual(buffer.slice(4),
          messages.types.F32.createBuffer(value))
      })

      it('F64 should have the value of the given position', () => {
        const buffer = new Buffer(8)
        const value = Math.random()
        buffer.writeDoubleLE(value, 0)
        assert.equal(buffer.readDoubleLE(0),
          new messages.types.F64(buffer, 0).value)
        assert.deepEqual(buffer, messages.types.F64.createBuffer(value))
      })
    })

    describe('Vectors', () => {
      it('LLVector3 should store a array of 3 floats', () => {
        const buffer = new Buffer(4 * 4)
        ;[1.1, 2.2, 3.3, 4.4].forEach((num, i) => {
          buffer.writeFloatLE(num, i * 4)
        })
        assert.deepEqual([
          buffer.readFloatLE(4),
          buffer.readFloatLE(8),
          buffer.readFloatLE(12)
        ], new messages.types.LLVector3(buffer, 4).value)
        assert.deepEqual(buffer.slice(4),
          messages.types.LLVector3.createBuffer([2.2, 3.3, 4.4]))
      })

      it('LLVector3d should store a array of 3 floats', () => {
        const buffer = new Buffer(4 * 8)
        const array = [1.1, 2.2, 3.3, 4.4]
        array.forEach((num, i) => buffer.writeDoubleLE(num, i * 8))
        assert.deepEqual([
          buffer.readDoubleLE(8),
          buffer.readDoubleLE(16),
          buffer.readDoubleLE(24)
        ], new messages.types.LLVector3d(buffer, 8).value)
        assert.deepEqual(buffer.slice(8),
          messages.types.LLVector3d.createBuffer(array.slice(1)))
      })

      it('LLVector4 should store a array of 3 floats', () => {
        const buffer = new Buffer(5 * 4)
        const array = [1.1, 2.2, 3.3, 4.4, 5.5]
        array.forEach((num, i) => buffer.writeFloatLE(num, i * 4))
        assert.deepEqual([
          buffer.readFloatLE(4),
          buffer.readFloatLE(8),
          buffer.readFloatLE(12),
          buffer.readFloatLE(16)
        ], new messages.types.LLVector4(buffer, 4).value)
        assert.deepEqual(buffer.slice(4),
          messages.types.LLVector4.createBuffer(array.slice(1)))
      })

      it('LLQuaternion should store a array of 3 floats', () => {
        const buffer = new Buffer(4 * 4)
        ;[1.1, 2.2, 3.3, 4.4].forEach((num, i) => {
          buffer.writeFloatLE(num, i * 4)
        })
        assert.deepEqual([
          buffer.readFloatLE(4),
          buffer.readFloatLE(8),
          buffer.readFloatLE(12)
        ], new messages.types.LLQuaternion(buffer, 4).value)
        assert.deepEqual(buffer.slice(4),
          messages.types.LLQuaternion.createBuffer([2.2, 3.3, 4.4]))
      })
    })

    describe('LLUUID', () => {
      it('should store a valid UUID', () => {
        const buffer = new Buffer(16)
        uuid.v4(null, buffer)
        const idString = new messages.types.LLUUID(buffer, 0).value
        assert.deepEqual(buffer, messages.types.LLUUID.createBuffer(idString))
      })
    })

    describe('BOOL', () => {
      it('should store either a true or a false', () => {
        const buffer = new Buffer([0, 1])
        assert.equal(buffer.readUInt8(0) !== 0,
          new messages.types.BOOL(buffer, 0).value)
        assert.equal(buffer.readUInt8(1) !== 0,
          new messages.types.BOOL(buffer, 1).value)
        assert.equal(1, messages.types.BOOL.createBuffer(true)[0])
        assert.equal(0, messages.types.BOOL.createBuffer(false)[0])
      })
    })

    describe('IPADDR & IPPORT', () => {
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
      const buffer = new Buffer(ipAddress)
      // IP RegExp
      const reg = new RegExp('^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).)' +
        '{3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$')

      it('should parse a valid ip-address', () => {
        assert.equal(true,
          reg.test(new messages.types.IPADDR(buffer, 0).value))
      })
      it('should parse a valid ip-port', () => {
        assert.equal(buffer.readUInt16LE(4),
          new messages.types.IPPORT(buffer, 4).value)
      })
      it('should create valid buffers', () => {
        const addr = new Buffer([1, 2, 3, 4])
        assert.deepEqual(addr, messages.types.IPADDR.createBuffer('1.2.3.4'))
        assert.deepEqual(addr,
          messages.types.IPADDR.createBuffer([1, 2, 3, 4]))
        const port = new Buffer([136, 19])
        assert.deepEqual(port, messages.types.IPPORT.createBuffer(5000))
      })
    })
  })

  describe('Messages', () => {
    describe('parseBody', () => {
      const buffer = new Buffer(4 + 4 * (1 + 4 * 3) + 1)
      buffer.writeUInt8(255, 0)
      buffer.writeUInt8(255, 1)
      buffer.writeUInt16BE(1, 2)

      const U32 = messages.types.U32

      const testMessage = messages.parseBody(buffer)

      it('should return the TestMessage', () => {
        assert.equal(true, testMessage instanceof messages.MessageProto)
        assert.equal(true, testMessage instanceof messages.ReceivedMessage)
      })
      it('should have Blocks: TestBlock1 and NeighborBlock', () => {
        assert.equal('object', typeof testMessage.TestBlock1)
        assert.equal('TestBlock1', testMessage.TestBlock1.name)
        assert.equal('object', typeof testMessage.NeighborBlock)
        assert.equal('NeighborBlock', testMessage.NeighborBlock.name)
        assert.equal(true, Array.isArray(testMessage.blocks))
        assert.equal(2, testMessage.blocks.length)
      })
      it('should have one U32 in an array in the TestBlock1', () => {
        assert.equal(1, testMessage.TestBlock1.data.length)
        assert.equal('Test1', testMessage.TestBlock1.data[0].Test1.name)
        assert.equal('U32', testMessage.TestBlock1.data[0].Test1.type)
        assert.equal(true, testMessage.TestBlock1.data[0].Test1 instanceof U32)
      })
      it('should have 3 U32 in 4 Arrays in NeighborBlock', () => {
        const block2 = testMessage.NeighborBlock
        assert.equal(4, block2.data.length)
        assert.equal('object', typeof block2.data[0].Test0)
        assert.equal('object', typeof block2.data[0].Test1)
        assert.equal('object', typeof block2.data[0].Test2)
        assert.equal(3, block2.data[0].all.length)
        assert.equal('Test1', block2.data[0].Test1.name)
        assert.equal(true, block2.data[0].Test1 instanceof U32)
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
          const obj = messages.createBody('TestMessage', testMessage)
          assert.equal(true, obj.needsZeroencode)
          assert.equal(false, obj.couldBeTrusted)
          assert.equal(true, Buffer.isBuffer(obj.buffer))
          buffer = obj.buffer
        })
      it('should have a length of 56 bytes', () => {
        assert.equal(56, buffer.length)
      })
      it('should have the correct message number', () => {
        assert.equal(65535, buffer.readUInt16BE(0))
        assert.equal(1, buffer.readUInt16BE(2))
      })
      it('should store in TestBlock1 the correct value', () => {
        assert.equal(1337, buffer.readUInt32LE(4))
      })
      it('should store in NeighborBlock the correct values', done => {
        for (let i = 0; i < 12; i++) {
          assert.equal(i, buffer.readUInt32LE(8 + i * 4))
        }
        done()
      })
    })
  })
})
