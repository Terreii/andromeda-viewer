'use strict';

var util = require('util');

var uuid = require('uuid');

var messageTemplate = require('../jsBuilds/messageTemplate.json');

// This module implements the packages
// http://wiki.secondlife.com/wiki/Message

function MessageDataType () {
  this.value = null;
}
MessageDataType.prototype = {
  getNewOffset: function (offset) {
    return this.size + (offset || 0);
  },
  size: 0,
  type: 'MessageDataType'
};
MessageDataType.createBuffer = function createBuffer (value) {
  return new Buffer(0);
};

function Null () {
  this.value = null;
}
Null.prototype = new MessageDataType();
Null.prototype.type = 'Null';
Null.createBuffer = function createBufferNull (value) {
  return new Buffer(0);
};

// Arrays

function Fixed (buffer, offset, name, size) {
  offset = offset || 0;
  this.name = name;
  this.size = size;
  this.value = buffer.slice(offset, offset + size);
}
Fixed.prototype = new MessageDataType();
Fixed.prototype.type = 'Fixed';
Fixed.createBuffer = function createBufferFixed (value, length) {
  var buffy = new Buffer(length);
  if (typeof value === 'string') {
    buffy.write(value.substr(0, length));
  } else {
    for (var i = 0; i < length; ++i) {
      var v = (i < value.length) ? +value[i] : 0;
      buffy.writeUInt8(v, i);
    }
  }
  return buffy;
};

function Variable1 (buffer, offset, name) {
  offset = offset || 0;
  this.name = name;
  this.size = buffer.readUInt8(offset);
  var start = offset + 1;
  this.value = buffer.slice(start, start + this.size);
}
Variable1.prototype = new MessageDataType();
Variable1.prototype.type = 'Variable1';
Variable1.createBuffer = function createBufferVariable1 (value) {
  if (typeof value.length === 'undefined' || value.length > 255) {
    throw new TypeError('value must not be bigger than 255 bytes!');
  }
  var buffy;
  if (typeof value === 'string') {
    var text = new Buffer(value, 'utf8');
    var length = new Buffer([text.length + 1]);
    buffy = Buffer.concat([
      length,
      text,
      new Buffer([0])
    ]);
  } else {
    buffy = new Buffer(value.length + 1);
    buffy.writeUInt8(value.length, 0);
    for (var i = 0; i < value.length; ++i) {
      buffy.writeUInt8(value[i], i + 1);
    }
  }
  return buffy;
};

function Variable2 (buffer, offset, name) {
  offset = offset || 0;
  this.name = name;
  // On http://wiki.secondlife.com/wiki/Message it says it is big-endian
  // but it is actually a little-endian!
  this.size = buffer.readUInt16LE(offset);
  var start = offset + 2;
  this.value = buffer.slice(start, start + this.size);
}
Variable2.prototype = new MessageDataType();
Variable2.prototype.type = 'Variable2';
Variable2.createBuffer = function createBufferVariable2 (value) {
  if (typeof value.length === 'undefined' || value.length > 65535) {
    throw new TypeError('value must not be bigger than 65535 bytes!');
  }
  var buffy;
  if (typeof value === 'string') {
    var text = new Buffer(value, 'utf8');
    var length = new Buffer(2);
    length.writeUInt16LE(text.length + 1, 0);
    buffy = Buffer.concat([
      length,
      text,
      new Buffer([0])
    ]);
  } else {
    buffy = new Buffer(value.length + 2);
    buffy.writeUInt16LE(value.length, 0);
    for (var i = 0; i < value.length; ++i) {
      buffy.writeUInt8(value[i], i + 2);
    }
  }
  return buffy;
};

// Numbers

function NumberType (sined) {
  this.sined = sined;
}
NumberType.prototype = new MessageDataType();
NumberType.prototype.type = 'NumberType';

function U8 (buffer, offset, name) {
  offset = offset || 0;
  this.name = name;
  this.value = buffer.readUInt8(offset);
}
U8.prototype = new NumberType(false);
U8.prototype.size = 1;
U8.prototype.type = 'U8';
U8.createBuffer = function createBufferU8 (value) {
  return new Buffer([+value]);
};

function U16 (buffer, offset, name) {
  offset = offset || 0;
  this.name = name;
  this.value = buffer.readUInt16LE(offset);
}
U16.prototype = new NumberType(false);
U16.prototype.size = 2;
U16.prototype.type = 'U16';
U16.createBuffer = function createBufferU16 (value) {
  var buffy = new Buffer(2);
  buffy.writeInt16LE(+value, 0);
  return buffy;
};

function U32 (buffer, offset, name) {
  offset = offset || 0;
  this.name = name;
  this.value = buffer.readUInt32LE(offset);
}
U32.prototype = new NumberType(false);
U32.prototype.size = 4;
U32.prototype.type = 'U32';
U32.createBuffer = function createBufferU32 (value) {
  var buffy = new Buffer(4);
  buffy.writeUInt32LE(+value, 0);
  return buffy;
};

function U64 (buffer, offset, name) {
  offset = offset || 0;
  this.name = name;
  // TODO   -----------------------------------------------------------
  this.value = [
    buffer.readUInt32LE(offset + 4),
    buffer.readUInt32LE(offset)
  ];
}
U64.prototype = new NumberType(false);
U64.prototype.size = 8;
U64.prototype.type = 'U64';
U64.createBuffer = function createBufferU64 (value) {
  var buffy = new Buffer(8);
  buffy.writeUInt32LE(value[0], 0);
  buffy.writeUInt32LE(value[1], 4);
  return buffy;
};

function S8 (buffer, offset, name) {
  offset = offset || 0;
  this.name = name;
  this.value = buffer.readInt8(offset);
}
S8.prototype = new NumberType(true);
S8.prototype.size = 1;
S8.prototype.type = 'S8';
S8.createBuffer = function createBufferS8 (value) {
  var buffy = new Buffer(1);
  buffy.writeInt8(+value, 0);
  return buffy;
};

function S16 (buffer, offset, name) {
  offset = offset || 0;
  this.name = name;
  this.value = buffer.readInt16LE(offset);
}
S16.prototype = new NumberType(true);
S16.prototype.size = 2;
S16.prototype.type = 'S16';
S16.createBuffer = function createBufferS16 (value) {
  var buffy = new Buffer(2);
  buffy.writeInt16LE(+value, 0);
  return buffy;
};

function S32 (buffer, offset, name) {
  offset = offset || 0;
  this.name = name;
  this.value = buffer.readInt32LE(offset);
}
S32.prototype = new NumberType(true);
S32.prototype.size = 4;
S32.prototype.type = 'S32';
S32.createBuffer = function createBufferS32 (value) {
  var buffy = new Buffer(4);
  buffy.writeInt32LE(+value, 0);
  return buffy;
};

function S64 (buffer, offset, name) {
  offset = offset || 0;
  this.name = name;
  // TODO   -----------------------------------------------------------
  this.value = [
    buffer.readInt32LE(offset + 4),
    buffer.readUInt32LE(offset)
  ];
}
S64.prototype = new NumberType(true);
S64.prototype.size = 8;
S64.prototype.type = 'S64';
S64.createBuffer = function createBufferS64 (value) {
  var buffy = new Buffer(8);
  buffy.writeInt32LE(value[1], 0);
  buffy.writeUInt32LE(value[0], 4);
  return buffy;
};

function F32 (buffer, offset, name) {
  offset = offset || 0;
  this.name = name;
  this.value = buffer.readFloatLE(offset);
}
F32.prototype = new NumberType(true);
F32.prototype.size = 4;
F32.prototype.type = 'F32';
F32.createBuffer = function createBufferF32 (value) {
  var buffy = new Buffer(4);
  buffy.writeFloatLE(+value, 0);
  return buffy;
};

function F64 (buffer, offset, name) {
  offset = offset || 0;
  this.name = name;
  this.value = buffer.readDoubleLE(offset);
}
F64.prototype = new NumberType(true);
F64.prototype.size = 8;
F64.prototype.type = 'F64';
F64.createBuffer = function createBufferF64 (value) {
  var buffy = new Buffer(8);
  buffy.writeDoubleLE(+value, 0);
  return buffy;
};

// Vectors

function LLVector3 (buffer, offset, name) {
  offset = offset || 0;
  this.name = name;
  this.value = [
    buffer.readFloatLE(offset),
    buffer.readFloatLE(offset + 4),
    buffer.readFloatLE(offset + 8)
  ];
}
LLVector3.prototype = new MessageDataType();
LLVector3.prototype.size = 12;
LLVector3.prototype.type = 'LLVector3';
LLVector3.createBuffer = function createBufferLLVector3 (value) {
  var buffy = new Buffer(12);
  for (var i = 0; i < 3; ++i) {
    buffy.writeFloatLE(value[i] || 0, i * 4);
  }
  return buffy;
};

function LLVector3d (buffer, offset, name) {
  offset = offset || 0;
  this.name = name;
  this.value = [
    buffer.readDoubleLE(offset),
    buffer.readDoubleLE(offset + 8),
    buffer.readDoubleLE(offset + 16)
  ];
}
LLVector3d.prototype = new MessageDataType();
LLVector3d.prototype.size = 24;
LLVector3d.prototype.type = 'LLVector3d';
LLVector3d.createBuffer = function createBufferLLVector3d (value) {
  var buffy = new Buffer(24);
  for (var i = 0; i < 3; ++i) {
    buffy.writeDoubleLE(value[i] || 0, i * 8);
  }
  return buffy;
};

function LLVector4 (buffer, offset, name) {
  offset = offset || 0;
  this.name = name;
  this.value = [
    buffer.readFloatLE(offset),
    buffer.readFloatLE(offset + 4),
    buffer.readFloatLE(offset + 8),
    buffer.readFloatLE(offset + 12)
  ];
}
LLVector4.prototype = new MessageDataType();
LLVector4.prototype.size = 16;
LLVector4.prototype.type = 'LLVector4';
LLVector4.createBuffer = function createBufferLLVector4 (value) {
  var buffy = new Buffer(16);
  for (var i = 0; i < 4; ++i) {
    buffy.writeFloatLE(value[i] || 0, i * 4);
  }
  return buffy;
};

function LLQuaternion (buffer, offset, name) {
  offset = offset || 0;
  this.name = name;
  this.value = [
    buffer.readFloatLE(offset),
    buffer.readFloatLE(offset + 4),
    buffer.readFloatLE(offset + 8)
  ];
}
LLQuaternion.prototype = new MessageDataType();
LLQuaternion.prototype.size = 12;
LLQuaternion.prototype.type = 'LLQuaternion';
LLQuaternion.createBuffer = function createBufferLLQuaternion (value) {
  var buffy = new Buffer(12);
  for (var i = 0; i < 3; ++i) {
    buffy.writeFloatLE(value[i] || 0, i * 4);
  }
  return buffy;
};

// Data

function LLUUID (buffer, offset, name) {
  offset = offset || 0;
  this.name = name;
  this.value = uuid.unparse(buffer, offset);
}
LLUUID.prototype = new MessageDataType();
LLUUID.prototype.size = 16;
LLUUID.prototype.type = 'LLUUID';
LLUUID.createBuffer = function createBufferLLUUID (value) {
  var buffy = new Buffer(16);
  uuid.parse(value, buffy, 0);
  return buffy;
};

function BOOL (buffer, offset, name) {
  offset = offset || 0;
  this.name = name;
  this.value = buffer.readUInt8(offset) !== 0;
}
BOOL.prototype = new MessageDataType();
BOOL.prototype.size = 1;
BOOL.prototype.type = 'BOOL';
BOOL.createBuffer = function createBufferBOOL (value) {
  var buffy = new Buffer(1);
  buffy.writeUInt8(value ? 1 : 0, 0);
  return buffy;
};

function IPADDR (buffer, offset, name) {
  offset = offset || 0;
  this.name = name;
  this.value = buffer.readUInt8(offset) + '.' +
    buffer.readUInt8(offset + 1) + '.' +
    buffer.readUInt8(offset + 2) + '.' +
    buffer.readUInt8(offset + 3);
}
IPADDR.prototype = new MessageDataType();
IPADDR.prototype.size = 4;
IPADDR.prototype.type = 'IPADDR';
IPADDR.createBuffer = function createBufferIPADDR (value) {
  var buffy = new Buffer(4);
  if (typeof value === 'string') {
    value = value.split('.');
  }
  if (Array.isArray(value)) {
    value.forEach(function (byte, i) {
      buffy.writeUInt8(Number(byte), i);
    });
    return buffy;
  } else {
    throw new TypeError('Must be a string or an array!');
  }
};

function IPPORT (buffer, offset, name) {
  offset = offset || 0;
  this.name = name;
  this.value = buffer.readUInt16LE(offset);
}
IPPORT.prototype = new MessageDataType();
IPPORT.prototype.size = 2;
IPPORT.prototype.type = 'IPPORT';
IPPORT.createBuffer = function createBufferIPPORT (value) {
  var buffy = new Buffer(2);
  buffy.writeUInt16LE(+value, 0);
  return buffy;
};

var types = {
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
};

// messagesByName[Messagename]
var messagesByName = {};

// inside the frequency-objects the message will be stored with their number
var messagesByFrequency = {
  High: {}, // Should be 29 templates
  Medium: {}, // Should be 17 templates
  Low: {}, // Should be 426 templates
  Fixed: {} // Should be 3 templates
};

// stores all messages in a easy to fined way
messageTemplate.forEach(function (message) {
  messagesByName[message.name] = message;
  messagesByFrequency[message.frequency][message.number] = message;
});

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
function createBody (type, data) {
  if (typeof type !== 'string') {
    throw new TypeError('type must be a string!');
  }
  var template = messagesByName[type];
  if (template === undefined) {
    throw new Error('Message Template with the name ' + type +
      ' doesn\'t exist!');
  }

  var head; // the head is the number of the message type
  switch (template.frequency) {
    case 'High':
      head = new Buffer([template.number]);
      break;
    case 'Medium':
      head = new Buffer(2);
      head.writeUInt8(255, 0);
      head.writeUInt8(template.number, 1);
      break;
    case 'Low':
      head = new Buffer(4);
      head.writeUInt16BE(65535, 0);
      head.writeUInt16BE(template.number, 2);
      break;
    case 'Fixed':
      head = new Buffer(4);
      head.writeUInt32BE(template.number, 0);
      break;
    default:
      head = new Buffer(4);
  }

  // for every block in the template it creates a buffer
  var body = template.body.map(function (blockTemplate) {
    var dataBlock = data[blockTemplate.name];
    if (!Array.isArray(dataBlock)) {
      throw new TypeError(blockTemplate.name +
        ' is not defined in the message data');
    }
    if ((blockTemplate.quantity === 'Single' && dataBlock.length !== 1) ||
        (blockTemplate.quantity === 'Multiple' &&
        dataBlock.length !== blockTemplate.times)) {
      throw new TypeError('Quantity mismatch');
    }

    var body = [];
    if (blockTemplate.quantity === 'Variable') {
      body.push(new Buffer([dataBlock.length]));
    }

    dataBlock.forEach(function (block) { // same block times the quantity
      var bufferArr = blockTemplate.variables.map(function (varTemplate) {
        var varType = types[varTemplate.type];
        var value = block[varTemplate.name];
        try {
          var buff = varType.createBuffer(value, varTemplate.times);
        } catch (e) {
          console.error(e, varTemplate, value);
          throw e;
        }
        return buff;
      });

      body.push(Buffer.concat(bufferArr));
    });
    return Buffer.concat(body);
  });

  // combine all buffers into one array
  var allBuffers = [head];
  Array.prototype.push.apply(allBuffers, body);

  return {
    needsZeroencode: template.zerocoded,
    couldBeTrusted: template.trusted,
    buffer: Buffer.concat(allBuffers)
  };
}

// buffer -> Message
// Starts with the packet body http://wiki.secondlife.com/wiki/Packet_Layout
function parseBody (packetBody) {
  // browserify changes the Buffer to a Uint8Array
  if (!(packetBody instanceof Buffer || packetBody instanceof Uint8Array)) {
    throw new TypeError('packetBody needs a Buffer!');
  }

  var frequency;
  var num;
  var offset;

  if (packetBody.readUInt8(0) < 255) {
    frequency = 'High';
    num = packetBody.readUInt8(0);
    offset = 1;
  } else if (packetBody.readUInt8(1) < 255) {
    frequency = 'Medium';
    num = packetBody.readUInt8(1);
    offset = 2;
  } else if (packetBody.readUInt16BE(2) < 65530) { // 0xFFFA
    frequency = 'Low';
    num = packetBody.readUInt16BE(2);
    offset = 4;
  } else {
    frequency = 'Fixed';
    num = packetBody.readUInt32BE(0);
    offset = 4;
  }

  if (!messagesByFrequency[frequency][num]) {
    throw new Error('no message of this type');
  }

  var body = new ReceivedMessage(messagesByFrequency[frequency][num],
    packetBody.slice(offset));

  return body;
}

function MessageProto () {
  this.size = 0;
}
MessageProto.prototype = {
  name: 'Proto',
  frequency: 'Low',
  size: 0,
  number: 0,
  trusted: false,
  zerocoded: false,
  isOld: NaN,
  body: [],
  buffer: new Buffer(0)
};

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
// };
function ReceivedMessage (template, buffer) {
  if (typeof template === 'string') {
    template = messagesByName[template];
  }
  this.name = template.name;
  this.frequency = template.frequency;
  this.number = template.number;
  this.trusted = template.trusted;
  // no need for decoding, was done in circuit
  this.zerocoded = template.zerocoded;
  this.isOld = template.isOld;

  var self = this;
  // parse the blocks
  var offset = 0;
  var blocks = template.body.map(function (blockTemplate) {
    var thisBlock = {
      name: blockTemplate.name,
      data: []
    };
    // that the block is accessible through the name
    self[thisBlock.name] = thisBlock;
    var quantity = 0;
    switch (blockTemplate.quantity) {
      case 'Single':
        quantity = 1;
        break;
      case 'Multiple':
        quantity = blockTemplate.times;
        break;
      case 'Variable':
        quantity = buffer.readUInt8(offset);
        offset++;
        break;
      default:
        quantity = 0;
    }
    for (var i = 0; i < quantity; ++i) {
      var data = {};
      data.all = blockTemplate.variables.map(function (variableTempl) {
        // parse the variables
        var varType = variableTempl.type;
        if (varType === 'Variable') {
          varType = 'Variable' + variableTempl.times;
        }
        var Type = types[varType];
        var value = new Type(buffer, offset, variableTempl.name,
          variableTempl.times);
        offset += value.size;
        if (Type === Variable1) {
          offset += 1;
        }
        if (Type === Variable2) {
          offset += 2;
        }
        // that the variable is accessible through the name
        data[variableTempl.name] = value;
        return value;
      });
      thisBlock.data.push(data);
    }
    return thisBlock;
  });
  this.blocks = blocks;
  this.size = offset; // ??? or something other
  this.buffer = buffer.slice(0, offset);
}
util.inherits(ReceivedMessage, MessageProto);

module.exports = {
  types: types,

  messageTypes: {
    all: messageTemplate,
    byName: messagesByName,
    byFrequency: messagesByFrequency
  },

  parseBody: parseBody,

  createBody: createBody,

  MessageProto: MessageProto,

  ReceivedMessage: ReceivedMessage
};
