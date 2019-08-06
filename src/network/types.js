export class MessageDataType {
  constructor (type, toBuffer, parser) {
    this.type = type || 'MessageDataType'
    this.createBuffer = toBuffer
    this.parseBuffer = parser
  }
}

export const NullType = new MessageDataType(
  'Null',
  () => Buffer.alloc(0),
  () => null
)

// Arrays

export const Fixed = new MessageDataType('Fixed', (value = [], length) => {
  const buffy = Buffer.alloc(length)
  if (typeof value === 'string') {
    buffy.write(value.substr(0, length))
  } else {
    for (let i = 0; i < length; ++i) {
      const v = (i < value.length) ? +value[i] : 0
      buffy.writeUInt8(v, i)
    }
  }
  return buffy
}, (buffer, offset = { value: 0 }, size) => {
  const start = offset.value
  offset.value += size
  return buffer.slice(start, offset.value)
})

export const Variable1 = new MessageDataType('Variable1', (value = []) => {
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
}, (buffer, offset = { value: 0 }) => {
  const start = offset.value + 1
  const size = buffer.readUInt8(offset.value)
  offset.value = start + size
  return buffer.slice(start, offset.value)
})

export const Variable2 = new MessageDataType('Variable2', (value = []) => {
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
}, (buffer, offset = { value: 0 }) => {
  // On http://wiki.secondlife.com/wiki/Message it says it is big-endian
  // but it is actually a little-endian!
  const size = buffer.readUInt16LE(offset.value)
  const start = offset.value + 2
  offset.value = start + size
  return buffer.slice(start, offset.value)
})

// Numbers

export const U8 = new MessageDataType('U8', (value = 0) => {
  const buffy = Buffer.alloc(1)
  buffy.writeUInt8(+value, 0)
  return buffy
}, (buffer, offset = { value: 0 }) => {
  const value = buffer.readUInt8(offset.value)
  offset.value += 1
  return value
})

export const U16 = new MessageDataType('U16', (value = 0) => {
  const buffy = Buffer.alloc(2)
  buffy.writeInt16LE(+value, 0)
  return buffy
}, (buffer, offset = { value: 0 }) => {
  const value = buffer.readUInt16LE(offset.value)
  offset.value += 2
  return value
})

export const U32 = new MessageDataType('U32', (value = 0) => {
  const buffy = Buffer.alloc(4)
  buffy.writeUInt32LE(+value, 0)
  return buffy
}, (buffer, offset = { value: 0 }) => {
  const value = buffer.readUInt32LE(offset.value)
  offset.value += 4
  return value
})

export const U64 = new MessageDataType('U64', (value = 0) => {
  const buffy = Buffer.alloc(8)
  buffy.writeUInt32LE(value[0], 0)
  buffy.writeUInt32LE(value[1], 4)
  return buffy
}, (buffer, offset = { value: 0 }) => {
  // TODO   -----------------------------------------------------------
  const value = [
    buffer.readUInt32LE(offset.value + 4),
    buffer.readUInt32LE(offset.value)
  ]
  offset.value += 8
  return value
})

export const S8 = new MessageDataType('S8', (value = 0) => {
  const buffy = Buffer.alloc(1)
  buffy.writeInt8(+value, 0)
  return buffy
}, (buffer, offset = { value: 0 }) => {
  const value = buffer.readInt8(offset.value)
  offset.value += 1
  return value
})

export const S16 = new MessageDataType('S16', (value = 0) => {
  const buffy = Buffer.alloc(2)
  buffy.writeInt16LE(+value, 0)
  return buffy
}, (buffer, offset = { value: 0 }) => {
  const value = buffer.readInt16LE(offset.value)
  offset.value += 2
  return value
})

export const S32 = new MessageDataType('S32', (value = 0) => {
  const buffy = Buffer.alloc(4)
  buffy.writeInt32LE(+value, 0)
  return buffy
}, (buffer, offset = { value: 0 }) => {
  const value = buffer.readInt32LE(offset.value)
  offset.value += 4
  return value
})

export const S64 = new MessageDataType('S64', (value = 0) => {
  const buffy = Buffer.alloc(8)
  buffy.writeInt32LE(value[1], 0)
  buffy.writeUInt32LE(value[0], 4)
  return buffy
}, (buffer, offset = { value: 0 }) => {
  // TODO   -----------------------------------------------------------
  const value = [
    buffer.readInt32LE(offset + 4),
    buffer.readUInt32LE(offset)
  ]
  offset.value += 8
  return value
})

export const F32 = new MessageDataType('F32', (value = 0) => {
  const buffy = Buffer.alloc(4)
  buffy.writeFloatLE(+value, 0)
  return buffy
}, (buffer, offset = { value: 0 }) => {
  const value = buffer.readFloatLE(offset.value)
  offset.value += 4
  return value
})

export const F64 = new MessageDataType('F64', (value = 0) => {
  const buffy = Buffer.alloc(8)
  buffy.writeDoubleLE(+value, 0)
  return buffy
}, (buffer, offset = { value: 0 }) => {
  const value = buffer.readDoubleLE(offset.value)
  offset.value += 8
  return value
})

// Vectors

export const LLVector3 = new MessageDataType('LLVector3', (value = []) => {
  const buffy = Buffer.alloc(12)
  for (let i = 0; i < 3; ++i) {
    buffy.writeFloatLE(value[i] || 0, i * 4)
  }
  return buffy
}, (buffer, offset = { value: 0 }) => {
  const value = [
    buffer.readFloatLE(offset.value),
    buffer.readFloatLE(offset.value + 4),
    buffer.readFloatLE(offset.value + 8)
  ]
  offset.value += 12
  return value
})

export const LLVector3d = new MessageDataType('LLVector3d', (value = []) => {
  const buffy = Buffer.alloc(24)
  for (let i = 0; i < 3; ++i) {
    buffy.writeDoubleLE(value[i] || 0, i * 8)
  }
  return buffy
}, (buffer, offset = { value: 0 }) => {
  const value = [
    buffer.readDoubleLE(offset.value),
    buffer.readDoubleLE(offset.value + 8),
    buffer.readDoubleLE(offset.value + 16)
  ]
  offset.value += 24
  return value
})

export const LLVector4 = new MessageDataType('LLVector4', (value = []) => {
  const buffy = Buffer.alloc(16)
  for (let i = 0; i < 4; ++i) {
    buffy.writeFloatLE(value[i] || 0, i * 4)
  }
  return buffy
}, (buffer, offset = { value: 0 }) => {
  const value = [
    buffer.readFloatLE(offset.value),
    buffer.readFloatLE(offset.value + 4),
    buffer.readFloatLE(offset.value + 8),
    buffer.readFloatLE(offset.value + 12)
  ]
  offset.value += 16
  return value
})

export const LLQuaternion = new MessageDataType('LLQuaternion', (value = []) => {
  const buffy = Buffer.alloc(12)
  for (let i = 0; i < 3; ++i) {
    buffy.writeFloatLE(value[i] || 0, i * 4)
  }
  return buffy
}, (buffer, offset = { value: 0 }) => {
  const value = [
    buffer.readFloatLE(offset.value),
    buffer.readFloatLE(offset.value + 4),
    buffer.readFloatLE(offset.value + 8)
  ]
  offset.value += 12
  return value
})

// Data

export const LLUUID = new MessageDataType(
  'LLUUID',
  (value = '00000000-0000-0000-0000-000000000000') => {
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
  },
  (buffer, offset = { value: 0 }) => {
    const start = offset.value
    const startPart2 = offset.value + 4
    const startPart3 = offset.value + 6
    const startPart4 = offset.value + 8
    const startPart5 = offset.value + 10
    offset.value += 16
    const uuidString = [
      buffer.slice(start, startPart2),
      buffer.slice(startPart2, startPart3),
      buffer.slice(startPart3, startPart4),
      buffer.slice(startPart4, startPart5),
      buffer.slice(startPart5, offset.value)
    ].map(buffy => buffy.toString('hex')).join('-')
    return uuidString
  }
)

export const BOOL = new MessageDataType('BOOL', (value = false) => {
  const buffy = Buffer.alloc(1)
  buffy.writeUInt8(value ? 1 : 0, 0)
  return buffy
}, (buffer, offset = { value: 0 }) => {
  const value = buffer.readUInt8(offset.value) !== 0
  offset.value += 1
  return value
})

export const IPADDR = new MessageDataType('IPADDR', (value = [0, 0, 0, 0]) => {
  const buffy = Buffer.alloc(4)
  const parts = typeof value === 'string' ? value.split('.') : value
  if (Array.isArray(parts)) {
    parts.forEach((byte, i) => buffy.writeUInt8(Number(byte), i))
    return buffy
  } else {
    throw new TypeError('Must be a string or an array!')
  }
}, (buffer, offset = { value: 0 }) => {
  const start = offset.value
  const first = buffer.readUInt8(start)
  const second = buffer.readUInt8(start + 1)
  const third = buffer.readUInt8(start + 2)
  const forth = buffer.readUInt8(start + 3)
  offset.value += 4
  return `${first}.${second}.${third}.${forth}`
})

export const IPPORT = new MessageDataType('IPPORT', (value = 0) => {
  const buffy = Buffer.alloc(2)
  buffy.writeUInt16LE(+value, 0)
  return buffy
}, (buffer, offset = { value: 0 }) => {
  const value = buffer.readUInt16LE(offset.value)
  offset.value += 2
  return value
})
