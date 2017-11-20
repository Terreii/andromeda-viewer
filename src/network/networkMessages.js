import uuid from 'uuid'

import messageTemplate from './messages.json'

// This module implements the packages
// http://wiki.secondlife.com/wiki/Message

class MessageDataType {
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

class Null extends MessageDataType {
  constructor () {
    super()
    this.value = null
    this.type = 'Null'
  }
}
Null.createBuffer = function createBufferNull (value) {
  return Buffer.alloc(0)
}

// Arrays
class Fixed extends MessageDataType {
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

class Variable1 extends MessageDataType {
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

class Variable2 extends MessageDataType {
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

class NumberType extends MessageDataType {
  constructor (sined) {
    super()
    this.sined = sined
    this.type = 'NumberType'
  }
}

class U8 extends NumberType {
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

class U16 extends NumberType {
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

class U32 extends NumberType {
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

class U64 extends NumberType {
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

class S8 extends NumberType {
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

class S16 extends NumberType {
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

class S32 extends NumberType {
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

class S64 extends NumberType {
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

class F32 extends NumberType {
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

class F64 extends NumberType {
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

class LLVector3 extends MessageDataType {
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

class LLVector3d extends MessageDataType {
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

class LLVector4 extends MessageDataType {
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

class LLQuaternion extends MessageDataType {
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

class LLUUID extends MessageDataType {
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
  const parts = []
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
  }
  const buffy = Buffer.alloc(16)
  uuid({random: parts}, buffy)
  return buffy
}

class BOOL extends MessageDataType {
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

class IPADDR extends MessageDataType {
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

class IPPORT extends MessageDataType {
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

export const types = {
  Null: Null,
  Fixed: Fixed,
  Variable1: Variable1,
  Variable2: Variable2,
  U8: U8,
  U16: U16,
  U32: U32,
  U64: U64,
  S8: S8,
  S16: S16,
  S32: S32,
  S64: S64,
  F32: F32,
  F64: F64,
  LLVector3: LLVector3,
  LLVector3d: LLVector3d,
  LLVector4: LLVector4,
  LLQuaternion: LLQuaternion,
  LLUUID: LLUUID,
  BOOL: BOOL,
  IPADDR: IPADDR,
  IPPORT: IPPORT
}

// messagesByName[Messagename]
const messagesByName = {}

// inside the frequency-objects the message will be stored with their number
const messagesByFrequency = {
  High: {}, // Should be 29 templates
  Medium: {}, // Should be 17 templates
  Low: {}, // Should be 426 templates
  Fixed: {} // Should be 3 templates
}

// stores all messages in a easy to fined way
messageTemplate.forEach(message => {
  messagesByName[message.name] = message
  messagesByFrequency[message.frequency][message.number] = message
})

export const messageTypes = {
  all: messageTemplate,
  byName: messagesByName,
  byFrequency: messagesByFrequency
}

// Message -> buffer (for sending)
// expects:
// type: String The name of the Message Type
// data:
// {
//   nameOfTheBlock: [   // times the quantity needed
//     {
//       variableName: value
//     }
//   ]
// }
export function createBody (type, data) {
  if (typeof type !== 'string') {
    throw new TypeError('type must be a string!')
  }
  const template = messagesByName[type]
  if (template === undefined) {
    throw new Error('Message Template with the name ' + type +
      " doesn't exist!")
  }

  let head // the head is the number of the message type
  switch (template.frequency) {
    case 'High':
      head = Buffer.from([template.number])
      break
    case 'Medium':
      head = Buffer.alloc(2)
      head.writeUInt8(255, 0)
      head.writeUInt8(template.number, 1)
      break
    case 'Low':
      head = Buffer.alloc(4)
      head.writeUInt16BE(65535, 0)
      head.writeUInt16BE(template.number, 2)
      break
    case 'Fixed':
      head = Buffer.alloc(4)
      head.writeUInt32BE(template.number, 0)
      break
    default:
      head = Buffer.alloc(4)
  }

  // for every block in the template it creates a buffer
  const body = template.body.map(blockTemplate => {
    const dataBlock = data[blockTemplate.name]
    if (!Array.isArray(dataBlock)) {
      throw new TypeError(blockTemplate.name +
        ' is not defined in the message data')
    }
    if ((blockTemplate.quantity === 'Single' && dataBlock.length !== 1) ||
      (blockTemplate.quantity === 'Multiple' &&
      dataBlock.length !== blockTemplate.times)) {
      throw new TypeError('Quantity mismatch')
    }

    const body = []
    if (blockTemplate.quantity === 'Variable') {
      body.push(Buffer.from([dataBlock.length]))
    }

    dataBlock.forEach(block => { // same block times the quantity
      const bufferArr = blockTemplate.variables.map(varTemplate => {
        const varType = types[varTemplate.type]
        const value = block[varTemplate.name]
        try {
          return varType.createBuffer(value, varTemplate.times)
        } catch (e) {
          console.error(e, varTemplate, value)
          throw e
        }
      })

      body.push(Buffer.concat(bufferArr))
    })
    return Buffer.concat(body)
  })

  // combine all buffers into one array
  const allBuffers = [head, ...body]

  return {
    needsZeroencode: template.zerocoded,
    couldBeTrusted: template.trusted,
    buffer: Buffer.concat(allBuffers)
  }
}

// buffer -> Message
// Starts with the packet body http://wiki.secondlife.com/wiki/Packet_Layout
export function parseBody (packetBody) {
  // browserify changes the Buffer to a Uint8Array
  if (!(packetBody instanceof Buffer || packetBody instanceof Uint8Array)) {
    throw new TypeError('packetBody needs a Buffer!')
  }

  let frequency
  let num
  let offset

  if (packetBody.readUInt8(0) < 255) {
    frequency = 'High'
    num = packetBody.readUInt8(0)
    offset = 1
  } else if (packetBody.readUInt8(1) < 255) {
    frequency = 'Medium'
    num = packetBody.readUInt8(1)
    offset = 2
  } else if (packetBody.readUInt16BE(2) < 65530) { // 0xFFFA
    frequency = 'Low'
    num = packetBody.readUInt16BE(2)
    offset = 4
  } else {
    frequency = 'Fixed'
    num = packetBody.readUInt32BE(0)
    offset = 4
  }

  if (!messagesByFrequency[frequency][num]) {
    throw new Error('no message of this type')
  }

  const body = new ReceivedMessage(messagesByFrequency[frequency][num],
    packetBody.slice(offset))

  return body
}

export class MessageProto {
  constructor () {
    this.size = 0
    this.name = 'Proto'
    this.frequency = 'Low'
    this.size = 0
    this.number = 0
    this.trusted = false
    this.zerocoded = false
    this.isOld = NaN
    this.body = []
    this.buffer = Buffer.alloc(0)
  }
}

// Class for all Buffer -> Message action (on socket in)
//
// {
//   name: String,
//   frequency: 'High'|'Medium'|'Low'|'Fixed',
//   number: Number,
//   trusted: Boolean,
//   zerocoded: Boolean,
//   isOld: undefined|String,
//   size: Number,
//   buffer: Buffer, // only of the message body
//   body: [
//     { // block
//       name: String,
//       data: [ // times the quantity of the block
//         {
//           nameOfTheVariable: { // MessageDataType
//             name: String,
//             value: valueOfTheVariable
//           },
//           all: [] // all variables
//         }
//       ]
//     }
//   ]
// }
export class ReceivedMessage extends MessageProto {
  constructor (template, buffer) {
    super()
    if (typeof template === 'string') {
      template = messagesByName[template]
    }
    this.name = template.name
    this.frequency = template.frequency
    this.number = template.number
    this.trusted = template.trusted
    // no need for decoding, was done in circuit
    this.zerocoded = template.zerocoded
    this.isOld = template.isOld

    const self = this
    // parse the blocks
    let offset = 0
    const blocks = template.body.map(blockTemplate => {
      const thisBlock = {
        name: blockTemplate.name,
        data: []
      }
      // that the block is accessible through the name
      self[thisBlock.name] = thisBlock
      let quantity = 0
      switch (blockTemplate.quantity) {
        case 'Single':
          quantity = 1
          break
        case 'Multiple':
          quantity = blockTemplate.times
          break
        case 'Variable':
          quantity = buffer.readUInt8(offset)
          offset++
          break
        default:
          quantity = 0
      }
      const thisBlockData = []
      for (let i = 0; i < quantity; ++i) {
        thisBlockData.push(i)
      }
      thisBlock.data = thisBlockData.map(i => {
        const data = {}
        data.all = blockTemplate.variables.map(variableTempl => {
          // parse the variables
          let varType = variableTempl.type
          if (varType === 'Variable') {
            varType = 'Variable' + variableTempl.times
          }
          const Type = types[varType]
          const value = new Type(buffer, offset, variableTempl.name,
            variableTempl.times)
          offset += value.size
          if (Type === Variable1) {
            offset += 1
          }
          if (Type === Variable2) {
            offset += 2
          }
          // that the variable is accessible through the name
          data[variableTempl.name] = value
          return value
        })
        return data
      })
      return thisBlock
    })
    this.blocks = blocks
    this.size = offset // ??? or something other
    this.buffer = buffer.slice(0, offset)
  }

  // Return the value of a variable in an block
  // msg.getValue(blockName, [blockIndex,] variableName)
  // blockIndex defaults to 0
  getValue (blockName, blockOrValue, varName) {
    let blockNumber = 0
    let variableName

    if (varName == null) {
      variableName = blockOrValue
    } else {
      blockNumber = +blockOrValue
      variableName = varName
    }

    return this[blockName].data[blockNumber][variableName].value
  }

  // Transforms the value of a variable into a string.
  // If the value is a Buffer (Fixed, Variable1 or Variable2)
  // then it will be parsed as a UTF-8 String.
  getStringValue (blockName, blockOrValue, varName) {
    const value = this.getValue(blockName, blockOrValue, varName)

    return Buffer.isBuffer(value)
      ? value.toString('utf8').replace(/\0/gi, '')
      : value.toString()
  }
}
