import messageTemplate from './messages.json'
import * as types from './types'

// This module implements the packages
// http://wiki.secondlife.com/wiki/Message

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
    return createBlockBuffer(blockTemplate, dataBlock)
  })

  // combine all buffers into one array
  const allBuffers = [head, ...body]

  return {
    needsZeroEncode: template.zerocoded,
    couldBeTrusted: template.trusted,
    buffer: Buffer.concat(allBuffers)
  }
}

// Maps all instances of a block into a buffer.
function createBlockBuffer (blockTemplate, blocks = []) {
  if (blocks instanceof Object && !Array.isArray(blocks)) {
    blocks = [blocks]
  }

  const body = []
  let times = 0

  switch (blockTemplate.quantity) {
    case 'Single':
      times = 1
      break
    case 'Multiple':
      times = blockTemplate.times
      break
    case 'Variable':
      times = Math.min(blocks.length, 255)
      body.push(Buffer.from([times])) // add byte that tells how often this block exists
      break
    default:
      throw new TypeError('Unknown Quantity!')
  }

  // same block times the quantity
  for (let index = 0; index < times; index += 1) {
    const blockInstance = blocks[index]
    const bufferArr = singleBlockToBuffer(blockTemplate.variables, blockInstance)
    body.push(Buffer.concat(bufferArr))
  }
  return Buffer.concat(body)
}

// Maps all variables of a block instance into an array of buffers
function singleBlockToBuffer (variables, block = {}) {
  const bufferArr = variables.map(varTemplate => {
    const varType = types[varTemplate.type]
    const value = block[varTemplate.name]
    try {
      return varType.createBuffer(value, varTemplate.times)
    } catch (e) {
      console.error(e, varTemplate, value)
      throw e
    }
  })
  return bufferArr
}

// buffer -> Message
// Starts with the packet body http://wiki.secondlife.com/wiki/Packet_Layout
export function parseBody (
  packetBody, ip = '0.0.0.0', port = 0, isResend = false, isReliable = false
) {
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

  const body = createReceivedMessage(
    messagesByFrequency[frequency][num],
    packetBody.slice(offset),
    ip,
    port,
    isResend,
    isReliable
  )

  return body
}

// Parses a block (and all instances of it) out of buffer
// Offset is an Object with a value key. This holds the offset in the buffer.
function parseBlock (blockTemplate, buffer, offset) {
  const thisBlock = []

  let quantity = 0
  switch (blockTemplate.quantity) {
    case 'Single':
      quantity = 1
      break
    case 'Multiple':
      quantity = blockTemplate.times
      break
    case 'Variable':
      quantity = buffer.readUInt8(offset.value)
      offset.value += 1
      break
    default:
      quantity = 0
  }

  for (let i = 0; i < quantity; i += 1) {
    const blockInstance = blockTemplate.variables.reduce((data, variableTemplate) => {
      const value = parseVariable(variableTemplate, buffer, offset)
      data[variableTemplate.name] = value
      return data
    }, {})

    thisBlock.push(blockInstance)
  }

  return thisBlock
}

// parse the variables of a block out of buffer.
// offset is an Object that holds the offset in the buffer in the key value.
function parseVariable (variableTemplate, buffer, offset) {
  let varType = variableTemplate.type
  if (varType === 'Variable') {
    varType = 'Variable' + variableTemplate.times
  }
  const Type = types[varType]
  const value = Type.parseBuffer(buffer, offset, variableTemplate.times)

  return value
}

// function for all Buffer -> Message action (on socket in)
//
// {
//   name: String,
//   frequency: 'High'|'Medium'|'Low'|'Fixed',
//   number: Number,
//   trusted: Boolean,
//   isReliable: Boolean,
//   isResend: Boolean,
//   zerocoded: Boolean,
//   isOld: undefined|String,
//   size: Number,
//   {BlockName}: [ // block; times the quantity of the block
//     {
//       // MessageDataType
//       {nameOfTheVariable}: value
//     }
//   ]
// }
function createReceivedMessage (
  template, buffer, ip = '0.0.0.0', port = 0, isResend = false, isReliable = false
) {
  if (typeof template === 'string') {
    template = messagesByName[template]
  }

  const msg = {
    name: template.name,
    type: 'udp/' + template.name, // for directly dispatching to redux
    trusted: template.trusted,
    isReliable,
    isResend,

    frequency: template.frequency,
    number: template.number,
    isOld: template.isOld,

    from: {
      ip,
      port
    },

    blocks: {},
    size: 0
  }

  // parse the blocks
  const offset = {
    value: 0
  }

  const blocks = template.body.map(blockTemplate => {
    const block = parseBlock(blockTemplate, buffer, offset)
    msg[blockTemplate.name] = block
    return block
  })

  msg.blocks = blocks
  msg.size = offset.value // ??? or something other

  return msg
}
