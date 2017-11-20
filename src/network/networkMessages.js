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
          if (Type === types.Variable1) {
            offset += 1
          }
          if (Type === types.Variable2) {
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

    return this._parseValueAsString(value)
  }

  _parseValueAsString (value) {
    return Buffer.isBuffer(value)
      ? value.toString('utf8').replace(/\0/gi, '')
      : value.toString()
  }

  // Maps over every instance of a block.
  // expects the block name and a function.
  // The function receives a getValue function and the index.
  // The getValue function expects the name of a variable
  //     and as an optional second argument a Boolean if the value should be a String.
  mapBlock (blockName, fn) {
    return this[blockName].data.map((blockInstance, index) => {
      const getter = (valueName, asString = false) => {
        const value = blockInstance[valueName].value

        return asString
          ? this._parseValueAsString(value)
          : value
      }

      return fn(getter, index)
    })
  }
}
