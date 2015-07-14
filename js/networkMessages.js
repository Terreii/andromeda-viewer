'use strict';

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

function createBody (type, data) {

}

// Starts with the packet body http://wiki.secondlife.com/wiki/Packet_Layout
function parseBody (packetBody) {
  if (!(packetBody instanceof Buffer)) {
    throw new TypeError('packetBody neads a Buffer!');
  }

  var toParse;
  var num;
  var offset;

  if (packetBody.readUInt8(0) < 255) {
    toParse = high;
    num = packetBody.readUInt8(0);
    offset = 1;
  } else if (packetBody.readUInt8(1) < 255) {
    toParse = medium;
    num = packetBody.readUInt8(1);
    offset = 2;
  } else if (packetBody.readUInt16BE(2) < 65530) { // 0xFFFA
    toParse = low;
    num = packetBody.readUInt16BE(2);
    offset = 4;
  } else {
    toParse = fixed;
    num = packetBody.readUInt32BE(0);
    offset = 4;
  }

  if (!toParse[num]) {
    throw new Error('no message of this type');
  }

  var body = new toParse[num](packetBody.slice(offset));

  return body;
}

// Parse a block of a message.
// buffer is the Buffer from where it will be extracted
// offset where to start in the buffer
// quantity: how often this block is in the packet
//    null if it is variable and stored in the packet
// layout is an array of the types in the block (in order)
function parseBlock (buffer, offset, quantity, layout) {
  var originalOffset = offset;
  if (quantity === null) {
    quantity = buffer.readUInt8(0);
    offset++;
  }

  var allBlocks = [];

  for (var i = 0; i < quantity; i++) {
    var block = layout.map(function (Type) {
      var unit = new Type(buffer, offset);
      offset += +unit.size;
      return unit;
    });
    allBlocks.push(block);
  }

  return {
    blocks: allBlocks,
    size: offset - originalOffset
  };
}

// Messages

function MessageProto () {
  this.size = 0; // Size in bytes
}
// stores a reference to all blocks
MessageProto.prototype.blocks = [];
// How often will this type be sent? Also for identification
MessageProto.prototype.frequency = 'fixed';
// Number in the frequency
MessageProto.prototype.num = 0;
// Are 1 to 255 zero bytes in the body encoded to take 2 bytes?
MessageProto.prototype.zerocoded = false;

function TestMessage (packetBody) {
  var TestBlock1 = parseBlock(packetBody, 0, 1, [U32]);
  var TestBlock2 = parseBlock(packetBody, TestBlock1.size, 4, [U32, U32, U32]);

  this.size = TestBlock1.size + TestBlock2.size;
  this.TestBlock1 = TestBlock1;
  this.TestBlock2 = TestBlock2;
  this.blocks = [
    TestBlock1,
    TestBlock2
  ];
}
TestMessage.prototype = new MessageProto();
TestMessage.prototype.frequency = 'low';
TestMessage.prototype.num = 1;
TestMessage.prototype.zerocoded = true;

var high = {

};

var medium = {

};

var low = {
  1: TestMessage
};

var fixed = {

};

module.exports = {
  types: {
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
  },

  parseBody: parseBody,

  createBody: createBody,

  messageTypes: {
    TestMessage: TestMessage
  }
};
