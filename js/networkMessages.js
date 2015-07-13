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
  offset = offset  || 0;
  this.size = size;
  this.value = buffer.slice(offset, offset + size);
}
Fixed.prototype = new MessageDataType();

function Variable1 (buffer, offset) {
  offset = offset  || 0;
  this.size = buffer.readUInt8(offset);
  var start = offset + 1;
  this.value = buffer.slice(start, start + this.size);
}
Variable1.prototype = new MessageDataType();

function Variable2 (buffer, offset) {
  offset = offset  || 0;
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
  offset = offset  || 0;
  this.value = buffer.readUInt8(offset);
}
U8.prototype = new NumberType(false);
U8.prototype.size = 1;

function U16 (buffer, offset) {
  offset = offset  || 0;
  this.value = buffer.readUInt16LE(offset);
}
U16.prototype = new NumberType(false);
U16.prototype.size = 2;

function U32 (buffer, offset) {
  offset = offset  || 0;
  this.value = buffer.readUInt32LE(offset);
}
U32.prototype = new NumberType(false);
U32.prototype.size = 4;

function U64 (buffer, offset) {
  offset = offset  || 0;
  // TODO
}
U64.prototype = new NumberType(false);
U64.prototype.size = 8;

function S8 (buffer, offset) {
  offset = offset  || 0;
  this.value = buffer.readInt8(offset);
}
S8.prototype = new NumberType(true);
S8.prototype.size = 1;

function S16 (buffer, offset) {
  offset = offset  || 0;
  this.value = buffer.readInt16LE(offset);
}
S16.prototype = new NumberType(true);
S16.prototype.size = 2;

function S32 (buffer, offset) {
  offset = offset  || 0;
  this.value = buffer.readInt32LE(offset);
}
S32.prototype = new NumberType(true);
S32.prototype.size = 4;

function S64 (buffer, offset) {
  offset = offset  || 0;
  // TODO
}
S64.prototype = new NumberType(true);
S64.prototype.size = 8;

function F32 (buffer, offset) {
  offset = offset  || 0;
  this.value = buffer.readFloatLE(offset);
}
F32.prototype = new NumberType(true);
F32.prototype.size = 4;

function F64 (buffer, offset) {
  offset = offset  || 0;
  this.value = buffer.readDoubleLE(offset);
}
F64.prototype = new NumberType(true);
F64.prototype.size = 8;

// Vectors

function LLVector3 (buffer, offset) {
  offset = offset  || 0;
  this.value = [
    buffer.readFloatLE(offset),
    buffer.readFloatLE(offset + 4),
    buffer.readFloatLE(offset + 8)
  ];
}
LLVector3.prototype = new MessageDataType();
LLVector3.prototype.size = 12;

function LLVector3d (buffer, offset) {
  offset = offset  || 0;
  this.value = [
    buffer.readDoubleLE(offset),
    buffer.readDoubleLE(offset + 8),
    buffer.readDoubleLE(offset + 16)
  ];
}
LLVector3d.prototype = new MessageDataType();
LLVector3d.prototype.size = 24;

function LLVector4 (buffer, offset) {
  offset = offset  || 0;
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
  offset = offset  || 0;
  this.value = uuid.unparse(buffer, offset);
}
LLUUID.prototype = new MessageDataType();
LLUUID.prototype.size = 16;

function BOOL (buffer, offset) {
  offset = offset  || 0;
  this.value = buffer.readUInt8(offset) !== 0;
}
BOOL.prototype = new MessageDataType();
BOOL.prototype.size = 1;

function IPADDR (buffer, offset) {
  offset = offset  || 0;
  this.value = buffer.readUInt8(offset) + '.' +
    buffer.readUInt8(offset + 1) + '.' +
    buffer.readUInt8(offset + 2) + '.' +
    buffer.readUInt8(offset + 3);
}
IPADDR.prototype = new MessageDataType();
IPADDR.prototype.size = 4;

function IPPORT (buffer, offset) {
  offset = offset  || 0;
  this.value = buffer.readUInt16LE(offset);
}
IPPORT.prototype = new MessageDataType();
IPPORT.prototype.size = 2;

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
  }
};
