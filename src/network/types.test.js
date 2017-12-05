/* eslint-env jest */

'use strict'

import uuid from 'uuid'

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
  const buffy = Buffer.alloc(1, 0)

  test('should have a size of 0', () => {
    expect(NullType.createBuffer().byteLength).toBe(0)
  })

  test('should have a value of null', () => {
    expect(NullType.parseBuffer(buffy)).toBeNull()
  })
})

describe('Fixed', () => {
  const size = Math.floor(Math.random() * 20) + 3
  const array = []
  for (let i = 0; i < size + 50; i++) {
    array.push(i)
  }
  const offset = {
    value: 0
  }
  const buffer = Fixed.createBuffer(array, size)
  const fixed = Fixed.parseBuffer(buffer, offset, size)

  test(`buffer should have the size of ${size}`, () => {
    expect(buffer.byteLength).toBe(size)
  })
  test(`should return a buffer with the size of ${size}`, () => {
    expect(fixed.byteLength).toBe(size)
  })
  test('should return a buffer with 2 at index 2', () => {
    expect(fixed.readUInt8(2)).toBe(2)
  })
  test(`offset should be ${size}`, () => {
    expect(offset).toEqual({
      value: size
    })
  })
})

describe('Variable1', () => {
  const size = Math.floor(Math.random() * 20) + 1
  const array = []
  for (let i = 1; i <= size; i++) {
    array.push(i)
  }
  const offset = {
    value: 0
  }
  const buffer = Variable1.createBuffer(array)
  const variable = Variable1.parseBuffer(buffer, offset)

  test(`buffer should have the size of ${size + 1}`, () => {
    expect(buffer.byteLength).toBe(size + 1)
  })
  test(`should return a buffer with the size of ${size}`, () => {
    expect(variable.byteLength).toBe(size)
  })
  test('should return a buffer with 1 at index 0', () => {
    expect(variable.readUInt8(0)).toBe(1)
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
  test(`offset should be ${size + 1}`, () => {
    expect(offset).toEqual({
      value: size + 1
    })
  })

  test('should parse a string', () => {
    const aString = 'Hello world!'
    const buffer2 = Variable1.createBuffer(aString)
    const stringVar = Variable1.parseBuffer(buffer2, {value: 0})

    expect(stringVar.toString('utf8')).toBe(aString + '\0')
    expect(buffer2.byteLength).toBe(14)
  })
})

describe('Variable2', () => {
  const size = Math.floor(Math.random() * 20) + 1
  const array = []
  for (let i = 1; i <= size; i++) {
    array.push(i)
  }
  const offset = {
    value: 0
  }
  const buffer = Variable2.createBuffer(array)
  const variable = Variable2.parseBuffer(buffer, offset)

  test(`buffer should have the size of ${size + 2}`, () => {
    expect(buffer.byteLength).toBe(size + 2)
  })
  test(`should return a buffer with the size of ${size}`, () => {
    expect(variable.byteLength).toBe(size)
  })
  test('should return a buffer with 1 at index 0', () => {
    expect(variable.readUInt8(0)).toBe(1)
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
  test(`offset should be ${size + 2}`, () => {
    expect(offset).toEqual({
      value: size + 2
    })
  })

  test('should parse a string', () => {
    const aString = 'Hello world!'
    const buffer2 = Variable2.createBuffer(aString)
    const stringVar = Variable2.parseBuffer(buffer2, {value: 0})

    expect(stringVar.toString('utf8')).toBe(aString + '\0')
    expect(buffer2.byteLength).toBe(15)
  })
})

describe('Numbers', () => {
  const posBuffer = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8])
  const negBuffer = Buffer.from([-1, -2, -3, -4, -5, -6, -7, -8])

  test('U8 should have the unsigned value of the given position', () => {
    const offset = Math.floor(Math.random() * 8)
    const offsetObj = {
      value: offset
    }

    expect(U8.parseBuffer(posBuffer, offsetObj))
      .toBe(posBuffer.readUInt8(offset))
    expect(U8.parseBuffer(negBuffer, {value: offset}))
      .toBe(negBuffer.readUInt8(offset))
    expect(U8.createBuffer(3)).toEqual(Buffer.from([3]))

    const buffy = U8.createBuffer(3)
    expect(U8.parseBuffer(buffy, {value: 0})).toBe(3)
    expect(buffy.byteLength).toBe(1)

    expect(offsetObj).toEqual({
      value: offset + 1
    })
  })

  test('U16 should have the unsigned value of the given position', () => {
    const offset = Math.floor(Math.random() * 4)
    const offsetObj = {
      value: offset
    }

    expect(U16.parseBuffer(posBuffer, offsetObj))
      .toBe(posBuffer.readUInt16LE(offset))
    expect(U16.parseBuffer(negBuffer, {value: offset}))
      .toBe(negBuffer.readUInt16LE(offset))
    expect(U16.createBuffer(3)).toEqual(Buffer.from([3, 0]))

    const buffy = U16.createBuffer(3)
    expect(U16.parseBuffer(buffy, {value: 0})).toBe(3)
    expect(buffy.byteLength).toBe(2)

    expect(offsetObj).toEqual({
      value: offset + 2
    })
  })

  test('U32 should have the unsigned value of the given position', () => {
    const offset = Math.floor(Math.random() * 2)
    const offsetObj = {
      value: offset
    }

    expect(U32.parseBuffer(posBuffer, offsetObj))
      .toBe(posBuffer.readUInt32LE(offset))
    expect(U32.parseBuffer(negBuffer, {value: offset}))
      .toBe(negBuffer.readUInt32LE(offset))
    expect(U32.createBuffer(3))
      .toEqual(Buffer.from([3, 0, 0, 0]))

    const buffy = U32.createBuffer(3)
    expect(U32.parseBuffer(buffy, {value: 0})).toBe(3)
    expect(buffy.byteLength).toBe(4)

    expect(offsetObj).toEqual({
      value: offset + 4
    })
  })

  test('S8 should have the signed value of the given position', () => {
    const offset = Math.floor(Math.random() * 8)
    const offsetObj = {
      value: offset
    }

    expect(S8.parseBuffer(posBuffer, offsetObj))
      .toBe(posBuffer.readInt8(offset))
    expect(S8.parseBuffer(negBuffer, {value: offset}))
      .toBe(negBuffer.readInt8(offset))
    expect(S8.createBuffer(-3))
      .toEqual(Buffer.from([-3]))

    const buffy = S8.createBuffer(3)
    expect(S8.parseBuffer(buffy, {value: 0})).toBe(3)
    expect(buffy.byteLength).toBe(1)

    expect(offsetObj).toEqual({
      value: offset + 1
    })
  })

  test('S16 should have the signed value of the given position', () => {
    const offset = Math.floor(Math.random() * 4)
    const offsetObj = {
      value: offset
    }

    expect(S16.parseBuffer(posBuffer, offsetObj))
      .toBe(posBuffer.readInt16LE(offset))
    expect(S16.parseBuffer(negBuffer, {value: offset}))
      .toBe(negBuffer.readInt16LE(offset))
    expect(S16.createBuffer(-3))
      .toEqual(Buffer.from([-3, 255]))

    const buffy = S16.createBuffer(3)
    expect(S16.parseBuffer(buffy, {value: 0})).toBe(3)
    expect(buffy.byteLength).toBe(2)

    expect(offsetObj).toEqual({
      value: offset + 2
    })
  })

  test('S32 should have the signed value of the given position', () => {
    const offset = Math.floor(Math.random() * 2)
    const offsetObj = {
      value: offset
    }

    expect(S32.parseBuffer(posBuffer, offsetObj))
      .toBe(posBuffer.readInt32LE(offset))
    expect(S32.parseBuffer(negBuffer, {value: offset}))
      .toBe(negBuffer.readInt32LE(offset))
    expect(S32.createBuffer(-3))
      .toEqual(Buffer.from([-3, 255, 255, 255]))

    const buffy = S32.createBuffer(3)
    expect(S32.parseBuffer(buffy, {value: 0})).toBe(3)
    expect(buffy.byteLength).toBe(4)

    expect(offsetObj).toEqual({
      value: offset + 4
    })
  })

  test('F32 should have the value of the given position', () => {
    const buffer = Buffer.alloc(8)
    const value = Math.random()
    buffer.writeFloatLE(value, 4)

    expect(F32.parseBuffer(buffer, {value: 4}))
      .toBe(buffer.readFloatLE(4))
    expect(F32.createBuffer(value))
      .toEqual(buffer.slice(4))

    const offset = {
      value: 0
    }
    const buffy = F32.createBuffer(3)
    expect(F32.parseBuffer(buffy, offset)).toBe(3)
    expect(buffy.byteLength).toBe(4)
    expect(offset).toEqual({
      value: 4
    })
  })

  test('F64 should have the value of the given position', () => {
    const buffer = Buffer.alloc(8)
    const value = Math.random()
    buffer.writeDoubleLE(value, 0)

    expect(F64.parseBuffer(buffer, {value: 0}))
      .toBe(buffer.readDoubleLE(0))
    expect(F64.createBuffer(value)).toEqual(buffer)

    const offset = {
      value: 0
    }
    const buffy = F64.createBuffer(3)
    expect(F64.parseBuffer(buffy, offset)).toBe(3)
    expect(buffy.byteLength).toBe(8)
    expect(offset).toEqual({
      value: 8
    })
  })
})

describe('Vectors', () => {
  test('LLVector3 should store a array of 3 floats', () => {
    const buffer = Buffer.alloc(4 * 4)
    ;[1.1, 2.2, 3.3, 4.4].forEach((num, i) => {
      buffer.writeFloatLE(num, i * 4)
    })

    expect(LLVector3.parseBuffer(buffer, {value: 4})).toEqual([
      buffer.readFloatLE(4),
      buffer.readFloatLE(8),
      buffer.readFloatLE(12)
    ])
    expect(LLVector3.createBuffer([2.2, 3.3, 4.4]))
      .toEqual(buffer.slice(4))

    const offset = {
      value: 0
    }
    const buffy = LLVector3.createBuffer([3, 4, 8.5])
    expect(LLVector3.parseBuffer(buffy, offset)).toEqual([3, 4, 8.5])
    expect(buffy.byteLength).toBe(4 * 3)
    expect(offset).toEqual({
      value: 12
    })
  })

  test('LLVector3d should store a array of 3 floats', () => {
    const buffer = Buffer.alloc(4 * 8)
    const array = [1.1, 2.2, 3.3, 4.4]
    array.forEach((num, i) => buffer.writeDoubleLE(num, i * 8))

    expect(LLVector3d.parseBuffer(buffer, {value: 8})).toEqual([
      buffer.readDoubleLE(8),
      buffer.readDoubleLE(16),
      buffer.readDoubleLE(24)
    ])
    expect(LLVector3d.createBuffer(array.slice(1)))
      .toEqual(buffer.slice(8))

    const offset = {
      value: 0
    }
    const buffy = LLVector3d.createBuffer([3, 4, 8.5])
    expect(LLVector3d.parseBuffer(buffy, offset)).toEqual([3, 4, 8.5])
    expect(buffy.byteLength).toBe(8 * 3)
    expect(offset).toEqual({
      value: 24
    })
  })

  test('LLVector4 should store a array of 4 floats', () => {
    const buffer = Buffer.alloc(5 * 4)
    const array = [1.1, 2.2, 3.3, 4.4, 5.5]
    array.forEach((num, i) => buffer.writeFloatLE(num, i * 4))

    expect(LLVector4.parseBuffer(buffer, {value: 4})).toEqual([
      buffer.readFloatLE(4),
      buffer.readFloatLE(8),
      buffer.readFloatLE(12),
      buffer.readFloatLE(16)
    ])
    expect(LLVector4.createBuffer(array.slice(1)))
      .toEqual(buffer.slice(4))

    const offset = {
      value: 0
    }
    const buffy = LLVector4.createBuffer([3, 4, 8.5, 2.25])
    expect(LLVector4.parseBuffer(buffy, offset)).toEqual([3, 4, 8.5, 2.25])
    expect(buffy.byteLength).toBe(4 * 4)
    expect(offset).toEqual({
      value: 16
    })
  })

  test('LLQuaternion should store a array of 3 floats', () => {
    const buffer = Buffer.alloc(4 * 4)
    ;[1.1, 2.2, 3.3, 4.4].forEach((num, i) => {
      buffer.writeFloatLE(num, i * 4)
    })
    expect(LLQuaternion.parseBuffer(buffer, {value: 4})).toEqual([
      buffer.readFloatLE(4),
      buffer.readFloatLE(8),
      buffer.readFloatLE(12)
    ])
    expect(LLQuaternion.createBuffer([2.2, 3.3, 4.4]))
      .toEqual(buffer.slice(4))

    const offset = {
      value: 0
    }
    const buffy = LLQuaternion.createBuffer([3, 4, 8.5])
    expect(LLQuaternion.parseBuffer(buffy, offset)).toEqual([3, 4, 8.5])
    expect(buffy.byteLength).toBe(4 * 3)
    expect(offset).toEqual({
      value: 12
    })
  })
})

describe('LLUUID', () => {
  test('should store a valid UUID', () => {
    const buffer = Buffer.alloc(16)
    uuid.v4(null, buffer)
    const idString = LLUUID.parseBuffer(buffer, {value: 0})
    const idString2 = uuid.v4()
    const buffy = LLUUID.createBuffer(idString2)
    const offset = {
      value: 0
    }

    expect(LLUUID.createBuffer(idString)).toEqual(buffer)
    expect(LLUUID.parseBuffer(buffy, offset)).toBe(idString2)
    expect(buffy.byteLength).toBe(16)
    expect(offset).toEqual({
      value: 16
    })
  })
})

describe('BOOL', () => {
  test('should store either a true or a false', () => {
    const buffer = Buffer.from([0, 1])
    const offset = {
      value: 0
    }

    expect(BOOL.parseBuffer(buffer, offset)).toBe(false)
    expect(BOOL.parseBuffer(buffer, {value: 1})).toBe(true)
    expect(BOOL.createBuffer(true)[0]).toBe(1)
    expect(BOOL.createBuffer(false)[0]).toBe(0)

    expect(BOOL.parseBuffer(BOOL.createBuffer(true))).toBe(true)
    expect(BOOL.parseBuffer(BOOL.createBuffer(false))).toBe(false)

    expect(offset).toEqual({
      value: 1
    })
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
    expect(reg.test(IPADDR.parseBuffer(buffer, {value: 0})))
      .toBe(true)

    const aArray = [127, 0, 0, 1]
    const ip = aArray.join('.')
    const buffy = IPADDR.createBuffer(aArray)
    const buffy2 = IPADDR.createBuffer(ip)
    const offset = {
      value: 0
    }

    expect(IPADDR.parseBuffer(buffy, offset)).toEqual(ip)
    expect(IPADDR.parseBuffer(buffy2, {value: 0})).toEqual(ip)
    expect(buffy.byteLength).toBe(4)
    expect(buffy2.byteLength).toBe(4)
    expect(offset).toEqual({
      value: 4
    })
  })

  test('should parse a valid ip-port', () => {
    expect(IPPORT.parseBuffer(buffer, {value: 4}))
      .toBe(buffer.readUInt16LE(4))

    const port = 666
    const buffy = IPPORT.createBuffer(port)
    const offset = {
      value: 0
    }
    expect(IPPORT.parseBuffer(buffy, offset)).toBe(666)
    expect(buffy.byteLength).toBe(2)
    expect(offset).toEqual({
      value: 2
    })
  })

  test('should create valid buffers', () => {
    const addr = Buffer.from([1, 2, 3, 4])
    expect(IPADDR.createBuffer('1.2.3.4')).toEqual(addr)
    expect(IPADDR.createBuffer([1, 2, 3, 4])).toEqual(addr)
    const port = Buffer.from([136, 19])
    expect(IPPORT.createBuffer(5000)).toEqual(port)
  })
})
