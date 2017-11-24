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
    needsZeroencode: template.zerocoded,
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

  const body = new ReceivedMessage(
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
//   {BlockName}: [ // block; times the quantity of the block
//     {
//       // MessageDataType
//       {nameOfTheVariable}: value
//     }
//   ]
// }
export class ReceivedMessage {
  constructor (template, buffer, ip = '0.0.0.0', port = 0, isResend = false, isReliable = false) {
    if (typeof template === 'string') {
      template = messagesByName[template]
    }
    this.name = template.name
    this.type = 'UDP' + template.name // for directly dispatching to redux
    this.trusted = template.trusted
    this.isReliable = isReliable
    this.isResend = isResend
    // no need for decoding, was done in circuit
    this.isOld = template.isOld
    this.from = {
      ip,
      port
    }

    // parse the blocks
    const offset = {
      value: 0
    }

    const blocks = template.body.map(blockTemplate => {
      const block = parseBlock(blockTemplate, buffer, offset)
      // that the block is accessible through the name
      this[blockTemplate.name] = block
      return block
    })
    this.blocks = blocks
    this.size = offset.value // ??? or something other
  }

  get frequency () {
    return messagesByName[this.name].frequency
  }

  get number () {
    return messagesByName[this.name].number
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

    return this[blockName][blockNumber][variableName]
  }

  // Transforms the value of a variable into a string.
  // If the value is a Buffer (Fixed, Variable1 or Variable2)
  // then it will be parsed as a UTF-8 String.
  getStringValue (blockName, blockOrValue, varName) {
    const value = this.getValue(blockName, blockOrValue, varName)

    return this._parseValueAsString(value)
  }

  // Return the value of multiple variables in an block
  // msg.getValue(blockName, [blockIndex,] variableNames)
  // blockIndex defaults to 0
  getValues (blockName, blockOrValues, varNames) {
    let blockNumber = 0
    let variableNames

    if (varNames == null) {
      variableNames = blockOrValues
    } else {
      blockNumber = +blockOrValues
      variableNames = varNames
    }
    if (!Array.isArray(variableNames)) throw new TypeError('names of variables must be an Array!')

    const blockInstance = this[blockName][blockNumber]
    if (variableNames.length === 0) {
      variableNames = Object.keys(blockInstance)
    }

    return variableNames.reduce((result, name) => {
      result[name] = blockInstance[name]
      return result
    }, {})
  }

  // Returns multiple values as a object.
  // Transforms the value of a variable into a string.
  // If the value is a Buffer (Fixed, Variable1 or Variable2)
  // then it will be parsed as a UTF-8 String.
  getStringValues (blockName, blockOrValues, varNames) {
    const values = this.getValues(blockName, blockOrValues, varNames)

    return Object.keys(values).reduce((result, key) => {
      result[key] = this._parseValueAsString(values[key])
      return result
    }, {})
  }

  _parseValueAsString (value) {
    return Buffer.isBuffer(value)
      ? value.toString('utf8').replace(/\0/gi, '')
      : value.toString()
  }

  // How many instances of a block are there?
  getNumberOfBlockInstances (blockName) {
    return this[blockName].length
  }

  // Maps over every instance of a block.
  // expects the block name and a function.
  // The function receives a getValue function and the index.
  // The getValue function expects the name of a variable
  //     and as an optional second argument a Boolean if the value should be a String.
  mapBlock (blockName, fn) {
    return this[blockName].map((blockInstance, index) => {
      const getter = (valueName, asString = false) => {
        const value = blockInstance[valueName]

        return asString
          ? this._parseValueAsString(value)
          : value
      }

      return fn(getter, index)
    })
  }
}
