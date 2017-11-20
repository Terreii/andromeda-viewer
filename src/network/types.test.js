/* eslint-env jest */

'use strict'

import uuid from 'uuid'
// import Buffer from 'Buffer'

import {
  NullType,
  Fixed,
  Variable1,
  Variable2,
  U8,
  U16,
  U32,
  // U64, // todo
  S8,
  S16,
  S32,
  // S64, // todo
  F32,
  F64,
  LLVector3,
  LLVector3d,
  LLVector4,
  LLQuaternion,
  LLUUID,
  BOOL,
  IPADDR,
  IPPORT
} from './types'

describe('Null', function () {
  const nullValue = new NullType()

  test('should have a size of 0', () => {
    expect(nullValue.size).toBe(0)
  })

  test('should hava a value of null', () => {
    expect(nullValue.value).toBeNull()
  })
})

describe('Fixed', () => {
  const size = Math.floor(Math.random() * 20) + 1
  const array = []
  for (let i = 0; i < size + 50; i++) {
    array.push(i)
  }
  const buffer = Fixed.createBuffer(array, size + 2)
  const fixed = new Fixed(buffer, 2, 'name', size)

  test(`should have the size of ${size}`, () => {
    expect(fixed.size).toBe(size)
  })
  test('should have a buffer as value with the size of ' + size, () => {
    expect(fixed.value.length).toBe(size)
  })
  test('should have a buffer with 2 at index 0', () => {
    expect(fixed.value.readUInt8(0)).toBe(2)
  })
})

describe('Variable1', () => {
  const size = Math.floor(Math.random() * 20) + 1
  const array = []
  for (let i = 1; i <= size; i++) {
    array.push(i)
  }
  const buffer = Variable1.createBuffer(array)
  const variable = new Variable1(buffer, 0)

  test('should have a size of ' + size, () => {
    expect(variable.size).toBe(size)
  })
  test('should have a buffer as value with the size of ' + size, () => {
    expect(variable.value.length).toBe(size)
  })
  test('should have a buffer with 1 at index 0', () => {
    expect(variable.value.readUInt8(0)).toBe(1)
  })
  test('should throw an error if non array like structures are given to ' +
    'createBuffer', () => {
    try {
      let test = Variable1.createBuffer({'0': 2})
      test = Variable1.createBuffer({length: 256})
      expect(test).toBeNull()
    } catch (e) {
      expect(true).toBe(true)
    }
  })

  test('should parse a string', () => {
    const aString = 'Hello world!'
    const buffer2 = Variable1.createBuffer(aString)
    const stringVar = new Variable1(buffer2, 0, 'test')

    expect(stringVar.value.toString('utf8')).toBe(aString + '\0')
    expect(buffer2.byteLength).toBe(14)
  })
})

describe('Variable2', () => {
  const size = Math.floor(Math.random() * 20) + 1
  const array = []
  for (let i = 1; i <= size; i++) {
    array.push(i)
  }
  const buffer = Variable2.createBuffer(array)
  const variable = new Variable2(buffer, 0)

  test('should have a size of ' + size, () => {
    expect(variable.size).toBe(size)
  })
  test('should have a buffer as value with the size of ' + size, () => {
    expect(variable.value.length).toBe(size)
  })
  test('should have a buffer with 1 at index 0', () => {
    expect(variable.value.readUInt8(0)).toBe(1)
  })
  test('should throw an error if non array like structures are given to ' +
    'createBuffer', () => {
    try {
      let test = Variable1.createBuffer({'0': 2})
      test = Variable1.createBuffer({length: 65536})
      expect(test).toBeNull()
    } catch (e) {
      expect(true).toBe(true)
    }
  })

  test('should parse a string', () => {
    const aString = 'Hello world!'
    const buffer2 = Variable2.createBuffer(aString)
    const stringVar = new Variable2(buffer2, 0, 'test')

    expect(stringVar.value.toString('utf8')).toBe(aString + '\0')
    expect(buffer2.byteLength).toBe(15)
  })
})

describe('Numbers', () => {
  const posBuffer = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8])
  const negBuffer = Buffer.from([-1, -2, -3, -4, -5, -6, -7, -8])
  test('U8 should have the unsigned value of the given position', () => {
    const offset = Math.floor(Math.random() * 8)

    expect(new U8(posBuffer, offset).value)
      .toBe(posBuffer.readUInt8(offset))
    expect(new U8(negBuffer, offset).value)
      .toBe(negBuffer.readUInt8(offset))
    expect(U8.createBuffer(3)).toEqual(Buffer.from([3]))

    const buffy = U8.createBuffer(3)
    expect(new U8(buffy, 0, '').value).toBe(3)
    expect(buffy.byteLength).toBe(1)
  })

  test('U16 should have the unsigned value of the given position', () => {
    const offset = Math.floor(Math.random() * 4)
    expect(new U16(posBuffer, offset).value)
      .toBe(posBuffer.readUInt16LE(offset))
    expect(new U16(negBuffer, offset).value)
      .toBe(negBuffer.readUInt16LE(offset))
    expect(U16.createBuffer(3)).toEqual(Buffer.from([3, 0]))

    const buffy = U16.createBuffer(3)
    expect(new U16(buffy, 0, '').value).toBe(3)
    expect(buffy.byteLength).toBe(2)
  })

  test('U32 should have the unsigned value of the given position', () => {
    const offset = Math.floor(Math.random() * 2)

    expect(new U32(posBuffer, offset).value)
      .toBe(posBuffer.readUInt32LE(offset))
    expect(new U32(negBuffer, offset).value)
      .toBe(negBuffer.readUInt32LE(offset))
    expect(U32.createBuffer(3))
      .toEqual(Buffer.from([3, 0, 0, 0]))

    const buffy = U32.createBuffer(3)
    expect(new U32(buffy, 0, '').value).toBe(3)
    expect(buffy.byteLength).toBe(4)
  })

  test('S8 should have the signed value of the given position', () => {
    const offset = Math.floor(Math.random() * 8)

    expect(new S8(posBuffer, offset).value)
      .toBe(posBuffer.readInt8(offset))
    expect(new S8(negBuffer, offset).value)
      .toBe(negBuffer.readInt8(offset))
    expect(S8.createBuffer(-3))
      .toEqual(Buffer.from([-3]))

    const buffy = S8.createBuffer(3)
    expect(new S8(buffy, 0, '').value).toBe(3)
    expect(buffy.byteLength).toBe(1)
  })

  test('S16 should have the signed value of the given position', () => {
    const offset = Math.floor(Math.random() * 4)

    expect(new S16(posBuffer, offset).value)
      .toBe(posBuffer.readInt16LE(offset))
    expect(new S16(negBuffer, offset).value)
      .toBe(negBuffer.readInt16LE(offset))
    expect(S16.createBuffer(-3))
      .toEqual(Buffer.from([-3, 255]))

    const buffy = S16.createBuffer(3)
    expect(new S16(buffy, 0, '').value).toBe(3)
    expect(buffy.byteLength).toBe(2)
  })

  test('S32 should have the signed value of the given position', () => {
    const offset = Math.floor(Math.random() * 2)

    expect(new S32(posBuffer, offset).value)
      .toBe(posBuffer.readInt32LE(offset))
    expect(new S32(negBuffer, offset).value)
      .toBe(negBuffer.readInt32LE(offset))
    expect(S32.createBuffer(-3))
      .toEqual(Buffer.from([-3, 255, 255, 255]))

    const buffy = S32.createBuffer(3)
    expect(new S32(buffy, 0, '').value).toBe(3)
    expect(buffy.byteLength).toBe(4)
  })

  test('F32 should have the value of the given position', () => {
    const buffer = Buffer.alloc(8)
    const value = Math.random()
    buffer.writeFloatLE(value, 4)

    expect(new F32(buffer, 4).value)
      .toBe(buffer.readFloatLE(4))
    expect(F32.createBuffer(value))
      .toEqual(buffer.slice(4))

    const buffy = F32.createBuffer(3)
    expect(new F32(buffy, 0, '').value).toBe(3)
    expect(buffy.byteLength).toBe(4)
  })

  test('F64 should have the value of the given position', () => {
    const buffer = Buffer.alloc(8)
    const value = Math.random()
    buffer.writeDoubleLE(value, 0)

    expect(new F64(buffer, 0).value)
      .toBe(buffer.readDoubleLE(0))
    expect(F64.createBuffer(value)).toEqual(buffer)

    const buffy = F64.createBuffer(3)
    expect(new F64(buffy, 0, '').value).toBe(3)
    expect(buffy.byteLength).toBe(8)
  })
})

describe('Vectors', () => {
  test('LLVector3 should store a array of 3 floats', () => {
    const buffer = Buffer.alloc(4 * 4)
    ;[1.1, 2.2, 3.3, 4.4].forEach((num, i) => {
      buffer.writeFloatLE(num, i * 4)
    })

    expect(new LLVector3(buffer, 4).value).toEqual([
      buffer.readFloatLE(4),
      buffer.readFloatLE(8),
      buffer.readFloatLE(12)
    ])
    expect(LLVector3.createBuffer([2.2, 3.3, 4.4]))
      .toEqual(buffer.slice(4))

    const buffy = LLVector3.createBuffer([3, 4, 8.5])
    expect(new LLVector3(buffy, 0, '').value).toEqual([3, 4, 8.5])
    expect(buffy.byteLength).toBe(4 * 3)
  })

  test('LLVector3d should store a array of 3 floats', () => {
    const buffer = Buffer.alloc(4 * 8)
    const array = [1.1, 2.2, 3.3, 4.4]
    array.forEach((num, i) => buffer.writeDoubleLE(num, i * 8))

    expect(new LLVector3d(buffer, 8).value).toEqual([
      buffer.readDoubleLE(8),
      buffer.readDoubleLE(16),
      buffer.readDoubleLE(24)
    ])
    expect(LLVector3d.createBuffer(array.slice(1)))
      .toEqual(buffer.slice(8))

    const buffy = LLVector3d.createBuffer([3, 4, 8.5])
    expect(new LLVector3d(buffy, 0, '').value).toEqual([3, 4, 8.5])
    expect(buffy.byteLength).toBe(8 * 3)
  })

  test('LLVector4 should store a array of 4 floats', () => {
    const buffer = Buffer.alloc(5 * 4)
    const array = [1.1, 2.2, 3.3, 4.4, 5.5]
    array.forEach((num, i) => buffer.writeFloatLE(num, i * 4))

    expect(new LLVector4(buffer, 4).value).toEqual([
      buffer.readFloatLE(4),
      buffer.readFloatLE(8),
      buffer.readFloatLE(12),
      buffer.readFloatLE(16)
    ])
    expect(LLVector4.createBuffer(array.slice(1)))
      .toEqual(buffer.slice(4))

    const buffy = LLVector4.createBuffer([3, 4, 8.5, 2.25])
    expect(new LLVector4(buffy, 0, '').value).toEqual([3, 4, 8.5, 2.25])
    expect(buffy.byteLength).toBe(4 * 4)
  })

  test('LLQuaternion should store a array of 3 floats', () => {
    const buffer = Buffer.alloc(4 * 4)
    ;[1.1, 2.2, 3.3, 4.4].forEach((num, i) => {
      buffer.writeFloatLE(num, i * 4)
    })
    expect(new LLQuaternion(buffer, 4).value).toEqual([
      buffer.readFloatLE(4),
      buffer.readFloatLE(8),
      buffer.readFloatLE(12)
    ])
    expect(LLQuaternion.createBuffer([2.2, 3.3, 4.4]))
      .toEqual(buffer.slice(4))

    const buffy = LLQuaternion.createBuffer([3, 4, 8.5])
    expect(new LLQuaternion(buffy, 0, '').value).toEqual([3, 4, 8.5])
    expect(buffy.byteLength).toBe(4 * 3)
  })
})

describe('LLUUID', () => {
  test('should store a valid UUID', () => {
    const buffer = Buffer.alloc(16)
    uuid.v4(null, buffer)
    const idString = new LLUUID(buffer, 0).value
    const idString2 = uuid.v4()
    const buffy = LLUUID.createBuffer(idString2)

    expect(LLUUID.createBuffer(idString)).toEqual(buffer)
    expect(new LLUUID(buffy, 0, '').value).toBe(idString2)
    expect(buffy.byteLength).toBe(16)
  })
})

describe('BOOL', () => {
  test('should store either a true or a false', () => {
    const buffer = Buffer.from([0, 1])

    expect(new BOOL(buffer, 0).value).toBe(false)
    expect(new BOOL(buffer, 1).value).toBe(true)
    expect(BOOL.createBuffer(true)[0]).toBe(1)
    expect(BOOL.createBuffer(false)[0]).toBe(0)

    expect(new BOOL(BOOL.createBuffer(true)).value).toBe(true)
    expect(new BOOL(BOOL.createBuffer(false)).value).toBe(false)
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
  const buffer = Buffer.from(ipAddress)
  // IP RegExp
  const reg = new RegExp('^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).)' +
    '{3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$')

  test('should parse a valid ip-address', () => {
    expect(reg.test(new IPADDR(buffer, 0).value))
      .toBe(true)

    const aArray = [127, 0, 0, 1]
    const ip = aArray.join('.')
    const buffy = IPADDR.createBuffer(aArray)
    const buffy2 = IPADDR.createBuffer(ip)

    expect(new IPADDR(buffy, 0, '').value).toEqual(ip)
    expect(new IPADDR(buffy2, 0, '').value).toEqual(ip)
    expect(buffy.byteLength).toBe(4)
    expect(buffy2.byteLength).toBe(4)
  })

  test('should parse a valid ip-port', () => {
    expect(new IPPORT(buffer, 4).value)
      .toBe(buffer.readUInt16LE(4))

    const port = 666
    const buffy = IPPORT.createBuffer(port)
    expect(new IPPORT(buffy, 0, '').value).toBe(666)
    expect(buffy.byteLength).toBe(2)
  })

  test('should create valid buffers', () => {
    const addr = Buffer.from([1, 2, 3, 4])
    expect(IPADDR.createBuffer('1.2.3.4')).toEqual(addr)
    expect(IPADDR.createBuffer([1, 2, 3, 4])).toEqual(addr)
    const port = Buffer.from([136, 19])
    expect(IPPORT.createBuffer(5000)).toEqual(port)
  })
})
