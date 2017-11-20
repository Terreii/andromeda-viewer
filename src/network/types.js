import uuid from 'uuid'

export class MessageDataType {
  constructor () {
    this.value = null
    this.size = 0
    this.type = 'MessageDataType'
  }

  getNewOffset (offset = 0) {
    return this.size + offset
  }
}
MessageDataType.createBuffer = function createBuffer (value) {
  return Buffer.alloc(0)
}

export class NullType extends MessageDataType {
  constructor () {
    super()
    this.value = null
    this.type = 'Null'
  }
}
NullType.createBuffer = function createBufferNull (value) {
  return Buffer.alloc(0)
}

// Arrays
export class Fixed extends MessageDataType {
  constructor (buffer, offset = 0, name, size) {
    super()
    this.name = name
    this.size = size
    this.value = buffer.slice(offset, offset + size)
    this.type = 'Fixed'
  }
}
Fixed.createBuffer = function createBufferFixed (value, length) {
  const buffy = Buffer.alloc(length)
  if (typeof value === 'string') {
    buffy.write(value.substr(0, length))
  } else {
    for (let i = 0; i < length; ++i) {
      let v = (i < value.length) ? +value[i] : 0
      buffy.writeUInt8(v, i)
    }
  }
  return buffy
}

export class Variable1 extends MessageDataType {
  constructor (buffer, offset = 0, name) {
    super()
    this.name = name
    this.size = buffer.readUInt8(offset)
    const start = offset + 1
    this.value = buffer.slice(start, start + this.size)
    this.type = 'Variable1'
  }
}
Variable1.createBuffer = function createBufferVariable1 (value) {
  if (typeof value.length === 'undefined' || value.length > 255) {
    throw new TypeError('value must not be bigger than 255 bytes!')
  }
  let buffy
  if (typeof value === 'string') {
    const text = Buffer.from(value, 'utf8')
    const length = Buffer.from([text.length + 1])
    buffy = Buffer.concat([
      length,
      text,
      Buffer.from([0])
    ])
  } else {
    buffy = Buffer.alloc(value.length + 1)
    buffy.writeUInt8(value.length, 0)
    for (let i = 0; i < value.length; ++i) {
      buffy.writeUInt8(value[i], i + 1)
    }
  }
  return buffy
}

export class Variable2 extends MessageDataType {
  constructor (buffer, offset = 0, name) {
    super()
    this.name = name
    // On http://wiki.secondlife.com/wiki/Message it says it is big-endian
    // but it is actually a little-endian!
    this.size = buffer.readUInt16LE(offset)
    const start = offset + 2
    this.value = buffer.slice(start, start + this.size)
    this.type = 'Variable2'
  }
}
Variable2.createBuffer = function createBufferVariable2 (value) {
  if (typeof value.length === 'undefined' || value.length > 65535) {
    throw new TypeError('value must not be bigger than 65535 bytes!')
  }
  let buffy
  if (typeof value === 'string') {
    const text = Buffer.from(value, 'utf8')
    const length = Buffer.alloc(2)
    length.writeUInt16LE(text.length + 1, 0)
    buffy = Buffer.concat([
      length,
      text,
      Buffer.from([0])
    ])
  } else {
    buffy = Buffer.alloc(value.length + 2)
    buffy.writeUInt16LE(value.length, 0)
    for (let i = 0; i < value.length; ++i) {
      buffy.writeUInt8(value[i], i + 2)
    }
  }
  return buffy
}

// Numbers

export class NumberType extends MessageDataType {
  constructor (sined) {
    super()
    this.sined = sined
    this.type = 'NumberType'
  }
}

export class U8 extends NumberType {
  constructor (buffer, offset = 0, name) {
    super(false)
    this.name = name
    this.value = buffer.readUInt8(offset)
    this.size = 1
    this.type = 'U8'
  }
}
U8.createBuffer = function createBufferU8 (value) {
  return Buffer.from([+value])
}

export class U16 extends NumberType {
  constructor (buffer, offset = 0, name) {
    super(false)
    this.name = name
    this.value = buffer.readUInt16LE(offset)
    this.size = 2
    this.type = 'U16'
  }
}
U16.createBuffer = function createBufferU16 (value) {
  const buffy = Buffer.alloc(2)
  buffy.writeInt16LE(+value, 0)
  return buffy
}

export class U32 extends NumberType {
  constructor (buffer, offset = 0, name) {
    super(false)
    this.name = name
    this.value = buffer.readUInt32LE(offset)
    this.size = 4
    this.type = 'U32'
  }
}
U32.createBuffer = function createBufferU32 (value) {
  const buffy = Buffer.alloc(4)
  buffy.writeUInt32LE(+value, 0)
  return buffy
}

export class U64 extends NumberType {
  constructor (buffer, offset = 0, name) {
    super(false)
    this.name = name
    // TODO   -----------------------------------------------------------
    this.value = [
      buffer.readUInt32LE(offset + 4),
      buffer.readUInt32LE(offset)
    ]
    this.size = 8
    this.type = 'U64'
  }
}
U64.createBuffer = function createBufferU64 (value) {
  const buffy = Buffer.alloc(8)
  buffy.writeUInt32LE(value[0], 0)
  buffy.writeUInt32LE(value[1], 4)
  return buffy
}

export class S8 extends NumberType {
  constructor (buffer, offset = 0, name) {
    super(true)
    this.name = name
    this.value = buffer.readInt8(offset)
    this.size = 1
    this.type = 'S8'
  }
}
S8.createBuffer = function createBufferS8 (value) {
  const buffy = Buffer.alloc(1)
  buffy.writeInt8(+value, 0)
  return buffy
}

export class S16 extends NumberType {
  constructor (buffer, offset = 0, name) {
    super(true)
    this.name = name
    this.value = buffer.readInt16LE(offset)
    this.size = 2
    this.type = 'S16'
  }
}
S16.createBuffer = function createBufferS16 (value) {
  const buffy = Buffer.alloc(2)
  buffy.writeInt16LE(+value, 0)
  return buffy
}

export class S32 extends NumberType {
  constructor (buffer, offset = 0, name) {
    super(true)
    this.name = name
    this.value = buffer.readInt32LE(offset)
    this.size = 4
    this.type = 'S32'
  }
}
S32.createBuffer = function createBufferS32 (value) {
  const buffy = Buffer.alloc(4)
  buffy.writeInt32LE(+value, 0)
  return buffy
}

export class S64 extends NumberType {
  constructor (buffer, offset = 0, name) {
    super(true)
    this.name = name
    // TODO   -----------------------------------------------------------
    this.value = [
      buffer.readInt32LE(offset + 4),
      buffer.readUInt32LE(offset)
    ]
    this.size = 8
    this.type = 'S64'
  }
}
S64.createBuffer = function createBufferS64 (value) {
  const buffy = Buffer.alloc(8)
  buffy.writeInt32LE(value[1], 0)
  buffy.writeUInt32LE(value[0], 4)
  return buffy
}

export class F32 extends NumberType {
  constructor (buffer, offset = 0, name) {
    super(true)
    this.name = name
    this.value = buffer.readFloatLE(offset)
    this.size = 4
    this.type = 'F32'
  }
}
F32.createBuffer = function createBufferF32 (value) {
  const buffy = Buffer.alloc(4)
  buffy.writeFloatLE(+value, 0)
  return buffy
}

export class F64 extends NumberType {
  constructor (buffer, offset = 0, name) {
    super(true)
    this.name = name
    this.value = buffer.readDoubleLE(offset)
    this.size = 8
    this.type = 'F64'
  }
}
F64.createBuffer = function createBufferF64 (value) {
  const buffy = Buffer.alloc(8)
  buffy.writeDoubleLE(+value, 0)
  return buffy
}

// Vectors

export class LLVector3 extends MessageDataType {
  constructor (buffer, offset = 0, name) {
    super()
    this.name = name
    this.value = [
      buffer.readFloatLE(offset),
      buffer.readFloatLE(offset + 4),
      buffer.readFloatLE(offset + 8)
    ]
    this.size = 12
    this.type = 'LLVector3'
  }
}
LLVector3.createBuffer = function createBufferLLVector3 (value) {
  const buffy = Buffer.alloc(12)
  for (let i = 0; i < 3; ++i) {
    buffy.writeFloatLE(value[i] || 0, i * 4)
  }
  return buffy
}

export class LLVector3d extends MessageDataType {
  constructor (buffer, offset = 0, name) {
    super()
    this.name = name
    this.value = [
      buffer.readDoubleLE(offset),
      buffer.readDoubleLE(offset + 8),
      buffer.readDoubleLE(offset + 16)
    ]
    this.size = 24
    this.type = 'LLVector3d'
  }
}
LLVector3d.createBuffer = function createBufferLLVector3d (value) {
  const buffy = Buffer.alloc(24)
  for (let i = 0; i < 3; ++i) {
    buffy.writeDoubleLE(value[i] || 0, i * 8)
  }
  return buffy
}

export class LLVector4 extends MessageDataType {
  constructor (buffer, offset = 0, name) {
    super()
    this.name = name
    this.value = [
      buffer.readFloatLE(offset),
      buffer.readFloatLE(offset + 4),
      buffer.readFloatLE(offset + 8),
      buffer.readFloatLE(offset + 12)
    ]
    this.size = 16
    this.type = 'LLVector4'
  }
}
LLVector4.createBuffer = function createBufferLLVector4 (value) {
  const buffy = Buffer.alloc(16)
  for (let i = 0; i < 4; ++i) {
    buffy.writeFloatLE(value[i] || 0, i * 4)
  }
  return buffy
}

export class LLQuaternion extends MessageDataType {
  constructor (buffer, offset = 0, name) {
    super()
    this.name = name
    this.value = [
      buffer.readFloatLE(offset),
      buffer.readFloatLE(offset + 4),
      buffer.readFloatLE(offset + 8)
    ]
    this.size = 12
    this.type = 'LLQuaternion'
  }
}
LLQuaternion.createBuffer = function createBufferLLQuaternion (value) {
  const buffy = Buffer.alloc(12)
  for (let i = 0; i < 3; ++i) {
    buffy.writeFloatLE(value[i] || 0, i * 4)
  }
  return buffy
}

// Data

export class LLUUID extends MessageDataType {
  constructor (buffer, offset = 0, name) {
    super()
    const numbers = buffer.slice(offset, offset + 16).toJSON().data
    this.name = name
    this.value = uuid({random: numbers})
    this.size = 16
    this.type = 'LLUUID'
  }
}
LLUUID.createBuffer = function createBufferLLUUID (value) {
  let parts = []
  if (typeof value === 'string') {
    const uuidString = value.replace(/-/gi, '')
    for (var i = 0; i < 16; ++i) {
      const index = i * 2
      const chars = uuidString.charAt(index) + uuidString.charAt(index + 1)
      const part = parseInt(chars, 16)
      parts.push(part)
    }
  } else if (!value.length || value.length < 16) {
    throw new Error('UUID value must be a String or Array like object' +
      ' with a length of 16')
  } else {
    parts = value.slice(0, 16)
  }
  const buffy = Buffer.from(parts)
  return buffy
}

export class BOOL extends MessageDataType {
  constructor (buffer, offset = 0, name) {
    super()
    this.name = name
    this.value = buffer.readUInt8(offset) !== 0
    this.size = 1
    this.type = 'BOOL'
  }
}
BOOL.createBuffer = function createBufferBOOL (value) {
  const buffy = Buffer.alloc(1)
  buffy.writeUInt8(value ? 1 : 0, 0)
  return buffy
}

export class IPADDR extends MessageDataType {
  constructor (buffer, offset = 0, name) {
    super()
    this.name = name
    const first = buffer.readUInt8(offset)
    const second = buffer.readUInt8(offset + 1)
    const third = buffer.readUInt8(offset + 2)
    const forth = buffer.readUInt8(offset + 3)
    this.value = `${first}.${second}.${third}.${forth}`
    this.size = 4
    this.type = 'IPADDR'
  }
}
IPADDR.createBuffer = function createBufferIPADDR (value) {
  const buffy = Buffer.alloc(4)
  const parts = typeof value === 'string' ? value.split('.') : value
  if (Array.isArray(parts)) {
    parts.forEach((byte, i) => buffy.writeUInt8(Number(byte), i))
    return buffy
  } else {
    throw new TypeError('Must be a string or an array!')
  }
}

export class IPPORT extends MessageDataType {
  constructor (buffer, offset = 0, name) {
    super()
    this.name = name
    this.value = buffer.readUInt16LE(offset)
    this.size = 2
    this.type = 'IPPORT'
  }
}
IPPORT.createBuffer = function createBufferIPPORT (value) {
  const buffy = Buffer.alloc(2)
  buffy.writeUInt16LE(+value, 0)
  return buffy
}
