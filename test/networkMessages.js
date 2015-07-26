'use strict';

var describe = require('mocha').describe;
var it = require('mocha').it;
var assert = require('assert');

var uuid = require('uuid');

var messages = require('../js/networkMessages');

describe('networkMessages', function () {
  describe('types', function () {
    describe('Null', function () {
      var Null = new messages.types.Null();
      it('should have a size of 0', function () {
        assert.equal(0, Null.size);
      });
      it('should hava a value of null', function () {
        assert.strictEqual(null, Null.value);
      });
    });

    describe('Fixed', function () {
      var size = Math.floor(Math.random() * 20) + 1;
      var array = [];
      for (var i = 0; i < size + 50; i++) {
        array.push(i);
      }
      var buffer = new Buffer(array);
      var fixed = new messages.types.Fixed(buffer, 2, size);
      it('should have the size of ' + size, function () {
        assert.equal(size, fixed.size);
      });
      it('should have a buffer as value with the size of ' + size, function () {
        assert.equal(size, fixed.value.length);
      });
      it('should have a buffer with 2 at index 0', function () {
        assert.equal(2, fixed.value.readUInt8(0));
      });
    });

    describe('Variable1', function () {
      var size = Math.floor(Math.random() * 20) + 1;
      var array = [size];
      for (var i = 1; i < size + 50; i++) {
        array.push(i);
      }
      var buffer = new Buffer(array);
      var variable = new messages.types.Variable1(buffer, 0);
      it('should have a size of ' + size, function () {
        assert.equal(size, variable.size);
      });
      it('should have a buffer as value with the size of ' + size, function () {
        assert.equal(size, variable.value.length);
      });
      it('should have a buffer with 1 at index 0', function () {
        assert.equal(1, variable.value.readUInt8(0));
      });
    });

    describe('Variable2', function () {
      var size = Math.floor(Math.random() * 20) + 1;
      var array = [size, 0];
      for (var i = 1; i < size + 50; i++) {
        array.push(i);
      }
      var buffer = new Buffer(array);
      var variable = new messages.types.Variable2(buffer, 0);
      it('should have a size of ' + size, function () {
        assert.equal(size, variable.size);
      });
      it('should have a buffer as value with the size of ' + size, function () {
        assert.equal(size, variable.value.length);
      });
      it('should have a buffer with 1 at index 0', function () {
        assert.equal(1, variable.value.readUInt8(0));
      });
    });

    describe('Numbers', function () {
      var posBuffer = new Buffer([1, 2, 3, 4, 5, 6, 7, 8]);
      var negBuffer = new Buffer([-1, -2, -3, -4, -5, -6, -7, -8]);
      it('U8 should have the unsigned value of the given position',
          function () {
        var offset = Math.floor(Math.random() * 8);
        assert.equal(posBuffer.readUInt8(offset),
          new messages.types.U8(posBuffer, offset).value);
        assert.equal(negBuffer.readUInt8(offset),
          new messages.types.U8(negBuffer, offset).value);
      });

      it('U16 should have the unsigned value of the given position',
          function () {
        var offset = Math.floor(Math.random() * 4);
        assert.equal(posBuffer.readUInt16LE(offset),
          new messages.types.U16(posBuffer, offset).value);
        assert.equal(negBuffer.readUInt16LE(offset),
          new messages.types.U16(negBuffer, offset).value);
      });

      it('U32 should have the unsigned value of the given position',
          function () {
        var offset = Math.floor(Math.random() * 2);
        assert.equal(posBuffer.readUInt32LE(offset),
          new messages.types.U32(posBuffer, offset).value);
        assert.equal(negBuffer.readUInt32LE(offset),
          new messages.types.U32(negBuffer, offset).value);
      });

      it('S8 should have the signed value of the given position', function () {
        var offset = Math.floor(Math.random() * 8);
        assert.equal(posBuffer.readInt8(offset),
          new messages.types.S8(posBuffer, offset).value);
        assert.equal(negBuffer.readInt8(offset),
          new messages.types.S8(negBuffer, offset).value);
      });

      it('S16 should have the signed value of the given position', function () {
        var offset = Math.floor(Math.random() * 4);
        assert.equal(posBuffer.readInt16LE(offset),
          new messages.types.S16(posBuffer, offset).value);
        assert.equal(negBuffer.readInt16LE(offset),
          new messages.types.S16(negBuffer, offset).value);
      });

      it('S32 should have the signed value of the given position', function () {
        var offset = Math.floor(Math.random() * 2);
        assert.equal(posBuffer.readInt32LE(offset),
          new messages.types.S32(posBuffer, offset).value);
        assert.equal(negBuffer.readInt32LE(offset),
          new messages.types.S32(negBuffer, offset).value);
      });

      it('F32 should have the value of the given position', function () {
        var buffer = new Buffer(8);
        var value = Math.random();
        buffer.writeFloatLE(value, 4);
        assert.equal(buffer.readFloatLE(4),
          new messages.types.F32(buffer, 4).value);
      });

      it('F64 should have the value of the given position', function () {
        var buffer = new Buffer(8);
        var value = Math.random();
        buffer.writeDoubleLE(value, 0);
        assert.equal(buffer.readDoubleLE(0),
          new messages.types.F64(buffer, 0).value);
      });
    });

    describe('Vectors', function () {
      it('LLVector3 should store a array of 3 floats', function () {
        var buffer = new Buffer(4 * 4);
        [1.1, 2.2, 3.3, 4.4].forEach(function (num, i) {
          buffer.writeFloatLE(num, i * 4);
        });
        assert.deepEqual([
          buffer.readFloatLE(4),
          buffer.readFloatLE(8),
          buffer.readFloatLE(12)
        ], new messages.types.LLVector3(buffer, 4).value);
      });

      it('LLVector3d should store a array of 3 floats', function () {
        var buffer = new Buffer(4 * 8);
        [1.1, 2.2, 3.3, 4.4].forEach(function (num, i) {
          buffer.writeDoubleLE(num, i * 8);
        });
        assert.deepEqual([
          buffer.readDoubleLE(8),
          buffer.readDoubleLE(16),
          buffer.readDoubleLE(24)
        ], new messages.types.LLVector3d(buffer, 8).value);
      });

      it('LLVector4 should store a array of 3 floats', function () {
        var buffer = new Buffer(5 * 4);
        [1.1, 2.2, 3.3, 4.4, 5.5].forEach(function (num, i) {
          buffer.writeFloatLE(num, i * 4);
        });
        assert.deepEqual([
          buffer.readFloatLE(4),
          buffer.readFloatLE(8),
          buffer.readFloatLE(12),
          buffer.readFloatLE(16)
        ], new messages.types.LLVector4(buffer, 4).value);
      });

      it('LLQuaternion should store a array of 3 floats', function () {
        var buffer = new Buffer(4 * 4);
        [1.1, 2.2, 3.3, 4.4].forEach(function (num, i) {
          buffer.writeFloatLE(num, i * 4);
        });
        assert.deepEqual([
          buffer.readFloatLE(4),
          buffer.readFloatLE(8),
          buffer.readFloatLE(12)
        ], new messages.types.LLQuaternion(buffer, 4).value);
      });
    });

    describe('LLUUID', function () {
      it('should store a valid UUID', function () {
        var buffer = new Buffer(16);
        uuid.v1({}, buffer);
        var idString = uuid.unparse(buffer);
        assert.equal(idString, new messages.types.LLUUID(buffer, 0).value);
      });
    });

    describe('BOOL', function () {
      it('should store either a true or a false', function () {
        var buffer = new Buffer([0, 1]);
        assert.equal(buffer.readUInt8(0) !== 0,
          new messages.types.BOOL(buffer, 0).value);
        assert.equal(buffer.readUInt8(1) !== 0,
          new messages.types.BOOL(buffer, 1).value);
      });
    });

    describe('IPADDR & IPPORT', function () {
      var ipAddress = [
        // IP
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255),
        // Port
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255)
      ];
      var buffer = new Buffer(ipAddress);
      // IP RegExp
      var reg = new RegExp('^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.)' +
        '{3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$');

      it('should parse a valid ip-address', function () {
        assert.equal(true,
          reg.test(new messages.types.IPADDR(buffer, 0).value));
      });
      it('should parse a valid ip-port', function () {
        assert.equal(buffer.readUInt16LE(4),
          new messages.types.IPPORT(buffer, 4).value);
      });
    });
  });

  describe('Messages', function () {
    describe('parseBody', function () {
      var buffer = new Buffer(4 + 4 * (1 + 4 * 3) + 1);
      buffer.writeUInt8(255, 0);
      buffer.writeUInt8(255, 1);
      buffer.writeUInt16BE(1, 2);

      var U32 = messages.types.U32;

      var testMessage = messages.parseBody(buffer);

      it('should return the TestMessage', function () {
        assert.equal(true, testMessage instanceof messages.MessageProto);
        assert.equal(true, testMessage instanceof messages.ReceivedMessage);
      });
      it('should have Blocks: TestBlock1 and NeighborBlock', function () {
        assert.equal('object', typeof testMessage.TestBlock1);
        assert.equal('TestBlock1', testMessage.TestBlock1.name);
        assert.equal('object', typeof testMessage.NeighborBlock);
        assert.equal('NeighborBlock', testMessage.NeighborBlock.name);
        assert.equal(true, Array.isArray(testMessage.blocks));
        assert.equal(2, testMessage.blocks.length);
      });
      it('should have one U32 in an array in the TestBlock1', function () {
        assert.equal(1, testMessage.TestBlock1.data.length);
        assert.equal('Test1', testMessage.TestBlock1.data[0].Test1.name);
        assert.equal('U32', testMessage.TestBlock1.data[0].Test1.type);
        assert.equal(true, testMessage.TestBlock1.data[0].Test1.value instanceof
          U32);
      });
      it('should have 3 U32 in 4 Arrays in NeighborBlock', function () {
        var block2 = testMessage.NeighborBlock;
        assert.equal(4, block2.data.length);
        assert.equal('object', typeof block2.data[0].Test0);
        assert.equal('object', typeof block2.data[0].Test1);
        assert.equal('object', typeof block2.data[0].Test2);
        assert.equal(3, block2.data[0].all.length);
        assert.equal('Test1', block2.data[0].Test1.name);
        assert.equal(true, block2.data[0].Test1.value instanceof U32);
      });
    });

    describe('createBody', function () {
      var buffer;
      it('should create a Object with a Buffer out of a JSON like object',
          function () {
        var testMessage = {
          TestBlock1: [
            {
              Test1: 1337
            }
          ],
          NeighborBlock: [
            {
              Test0: 0,
              Test1: 1,
              Test2: 2
            },
            {
              Test0: 3,
              Test1: 4,
              Test2: 5
            },
            {
              Test0: 6,
              Test1: 7,
              Test2: 8
            },
            {
              Test0: 9,
              Test1: 10,
              Test2: 11
            }
          ]
        };
        var obj = messages.createBody('TestMessage', testMessage);
        assert.equal(true, obj.needsZeroencode);
        assert.equal(false, obj.couldBeTrusted);
        assert.equal(true, Buffer.isBuffer(obj.buffer));
        buffer = obj.buffer;
      });
      it('should have a length of 56 bytes', function () {
        assert.equal(56, buffer.length);
      });
      it('should have the correct message number', function () {
        assert.equal(65535, buffer.readUInt16BE(0));
        assert.equal(1, buffer.readUInt16BE(2));
      });
      it('should store in TestBlock1 the correct value', function () {
        assert.equal(1337, buffer.readUInt32LE(4));
      });
      it('should store in NeighborBlock the correct values', function (done) {
        for (var i = 0; i < 12; i++) {
          assert.equal(i, buffer.readUInt32LE(8 + i * 4));
        }
        done();
      });
    });
  });
});
