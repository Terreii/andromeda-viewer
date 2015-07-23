'use strict';

var util = require('util');
var fs = require('fs');

var uuid = require('uuid');

// This module implements the packages
// http://wiki.secondlife.com/wiki/Message

function MessageDataType () {
  this.value = null;
}
MessageDataType.prototype = {
  getNewOffset: function (offset) {
    return this.size + (offset || 0);
  },
  size: 0
};

function Null () {
  this.value = null;
}
Null.prototype = new MessageDataType();

// Arrays

function Fixed (buffer, offset, size) {
  offset = offset || 0;
  this.size = size;
  this.value = buffer.slice(offset, offset + size);
}
Fixed.prototype = new MessageDataType();

function Variable1 (buffer, offset) {
  offset = offset || 0;
  this.size = buffer.readUInt8(offset);
  var start = offset + 1;
  this.value = buffer.slice(start, start + this.size);
}
Variable1.prototype = new MessageDataType();

function Variable2 (buffer, offset) {
  offset = offset || 0;
  this.size = buffer.readUInt16BE(offset);
  var start = offset + 2;
  this.value = buffer.slice(start, start + this.size);
}
Variable2.prototype = new MessageDataType();

// Numbers

function NumberType (sined) {
  this.sined = sined;
}
NumberType.prototype = new MessageDataType();

function U8 (buffer, offset) {
  offset = offset || 0;
  this.value = buffer.readUInt8(offset);
}
U8.prototype = new NumberType(false);
U8.prototype.size = 1;

function U16 (buffer, offset) {
  offset = offset || 0;
  this.value = buffer.readUInt16LE(offset);
}
U16.prototype = new NumberType(false);
U16.prototype.size = 2;

function U32 (buffer, offset) {
  offset = offset || 0;
  this.value = buffer.readUInt32LE(offset);
}
U32.prototype = new NumberType(false);
U32.prototype.size = 4;

function U64 (buffer, offset) {
  offset = offset || 0;
  // TODO
}
U64.prototype = new NumberType(false);
U64.prototype.size = 8;

function S8 (buffer, offset) {
  offset = offset || 0;
  this.value = buffer.readInt8(offset);
}
S8.prototype = new NumberType(true);
S8.prototype.size = 1;

function S16 (buffer, offset) {
  offset = offset || 0;
  this.value = buffer.readInt16LE(offset);
}
S16.prototype = new NumberType(true);
S16.prototype.size = 2;

function S32 (buffer, offset) {
  offset = offset || 0;
  this.value = buffer.readInt32LE(offset);
}
S32.prototype = new NumberType(true);
S32.prototype.size = 4;

function S64 (buffer, offset) {
  offset = offset || 0;
  // TODO
}
S64.prototype = new NumberType(true);
S64.prototype.size = 8;

function F32 (buffer, offset) {
  offset = offset || 0;
  this.value = buffer.readFloatLE(offset);
}
F32.prototype = new NumberType(true);
F32.prototype.size = 4;

function F64 (buffer, offset) {
  offset = offset || 0;
  this.value = buffer.readDoubleLE(offset);
}
F64.prototype = new NumberType(true);
F64.prototype.size = 8;

// Vectors

function LLVector3 (buffer, offset) {
  offset = offset || 0;
  this.value = [
    buffer.readFloatLE(offset),
    buffer.readFloatLE(offset + 4),
    buffer.readFloatLE(offset + 8)
  ];
}
LLVector3.prototype = new MessageDataType();
LLVector3.prototype.size = 12;

function LLVector3d (buffer, offset) {
  offset = offset || 0;
  this.value = [
    buffer.readDoubleLE(offset),
    buffer.readDoubleLE(offset + 8),
    buffer.readDoubleLE(offset + 16)
  ];
}
LLVector3d.prototype = new MessageDataType();
LLVector3d.prototype.size = 24;

function LLVector4 (buffer, offset) {
  offset = offset || 0;
  this.value = [
    buffer.readFloatLE(offset),
    buffer.readFloatLE(offset + 4),
    buffer.readFloatLE(offset + 8),
    buffer.readFloatLE(offset + 12)
  ];
}
LLVector4.prototype = new MessageDataType();
LLVector4.prototype.size = 16;

var LLQuaternion = LLVector3;

// Data

function LLUUID (buffer, offset) {
  offset = offset || 0;
  this.value = uuid.unparse(buffer, offset);
}
LLUUID.prototype = new MessageDataType();
LLUUID.prototype.size = 16;

function BOOL (buffer, offset) {
  offset = offset || 0;
  this.value = buffer.readUInt8(offset) !== 0;
}
BOOL.prototype = new MessageDataType();
BOOL.prototype.size = 1;

function IPADDR (buffer, offset) {
  offset = offset || 0;
  this.value = buffer.readUInt8(offset) + '.' +
    buffer.readUInt8(offset + 1) + '.' +
    buffer.readUInt8(offset + 2) + '.' +
    buffer.readUInt8(offset + 3);
}
IPADDR.prototype = new MessageDataType();
IPADDR.prototype.size = 4;

function IPPORT (buffer, offset) {
  offset = offset || 0;
  this.value = buffer.readUInt16LE(offset);
}
IPPORT.prototype = new MessageDataType();
IPPORT.prototype.size = 2;

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

// stores all messages
var allMessages = [];

// messagesByName[Messagename]
var messagesByName = {};

// inside the frequency-objects the message will be stored with their number
var messagesByFrequency = {
  High: {}, // Should be 29 templates
  Medium: {}, // Should be 17 templates
  Low: {}, // Should be 426 templates
  Fixed: {} // Should be 3 templates
};

// parse the message_template.msg and creates the templates for the messages
// http://secondlife.com/app/message_template/master_message_template.msg
// results in:
// [
//   {
//     name: String,
//     frequency: 'High'|'Medium'|'Low'|'Fixed',
//     number: Number,
//     trusted: Boolean,
//     zerocoded: Boolean,
//     isOld: undefined|String,
//     body: [
//       {
//         name: String,
//         quantity: 'Single'|'Multiple'|'Variable',
//         times: Number, // only if quantity is Multiple
//         variables: [
//           {
//             name: String,
//             type: types,
//             times: Number|NaN // by "Fixed"/"Variable"
//           }
//         ]
//       }
//     ]
//   }
// ]

// fs.readFile(process.cwd() + '/master_message_template.msg', {encoding: 'utf8'},
    // (function (err, data) {
(function () {
  var data = fs.readFileSync(process.cwd() + '/master_message_template.msg', {encoding: 'utf8'});
  // if (err) {
  //   console.error(err);
  //   return;
  // }
  allMessages = data.split('\n').map(function (line) {
    // remove the commens
    return line.replace(/\/\/.*$/, '').replace(/^\s+$/g, '');
  }).filter(function (line) {
    return line.length !== 0 && line !== 'version 2.0';
  }).reduce(function (combined, line) { // combine the blocks together
    switch (line.charAt(0)) {
      case '{': // start a new block
        combined.thisMessage = [];
        break;
      case '}': // the block is done
        combined.finished.push(combined.thisMessage);
        break;
      default:
        combined.thisMessage.push(line);
        break;
    }
    return combined;
  }, {
    finished: [],
    thisMessage: null
  }).finished.map(function (message) {
    // parse a message
    var head = message[0].trim().split(/\s+/g);
    var body = message.slice(1).reduce(function (blocks, line) {
      var trimed = line.trim();
      if (trimed.length === 1 && trimed.charAt(0) === '{') {
        blocks.thisBlock = {
          name: '',
          quantity: '',
          times: 0,
          variables: []
        };
      } else if (trimed.length === 1 && trimed.charAt(0) === '}') {
        blocks.all.push(blocks.thisBlock);
      } else if (trimed.charAt(0) !== '{') {
        // block info has no { at the beginning
        var info = trimed.split(/\s+/g);
        blocks.thisBlock.name = info[0];
        blocks.thisBlock.quantity = info[1];
        blocks.thisBlock.times = +info[2];
      } else if (trimed.charAt(0) === '{' && trimed.length > 2) {
        // all variables have the fromat { name type quantity? }
        var variable = trimed.split(/\s+/g);
        blocks.thisBlock.variables.push({
          name: variable[1],
          type: variable[2],
          times: +variable[3]
        });
      }
      return blocks;
    }, {
      all: [],
      thisBlock: null
    }).all;
    return {
      name: head[0],
      frequency: head[1],
      number: +head[2],
      trusted: head[3] === 'Trusted',
      zerocoded: head[4] === 'Zerocoded',
      isOld: head[5],
      body: body
    };
  });

  allMessages.forEach(function (message) {
    messagesByName[message.name] = message;
    messagesByFrequency[message.frequency][message.number] = message;
  });
})();

// Message -> buffer (for sending)
function createBody (type, data) {

}

// buffer -> Message
// Starts with the packet body http://wiki.secondlife.com/wiki/Packet_Layout
function parseBody (packetBody) {
  if (!(packetBody instanceof Buffer)) {
    throw new TypeError('packetBody neads a Buffer!');
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
//           nameOfTheVariable: {
//             name: String,
//             type: String,
//             value: MessageDataType
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
        var vari = {
          name: variableTempl.name,
          type: variableTempl.type,
          value: null // will store the actual value
        };
        if (vari.type === 'Variable') {
          vari.type = 'Variable' + variableTempl.times;
        }
        var Type = types[vari.type];
        vari.value = new Type(buffer, offset, variableTempl.times);
        offset += vari.value.size;
        // that the variable is accessible through the name
        data[variableTempl.name] = vari;
        return vari;
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

// Class for all Messages that will be sent to the grid
function MessageToSend () {

}
util.inherits(MessageToSend, MessageProto);

module.exports = {
  types: types,

  parseBody: parseBody,

  createBody: createBody,

  MessageProto: MessageProto,

  ReceivedMessage: ReceivedMessage,

  MessageToSend: MessageToSend
};
