'use strict';

/*
 * The circuit is the connection to the sim server
 *
 * Is a EventEmitter
 * emits on a packet in an event with the name of the message type
 * and the event 'packetReceived'
 */

var util = require('util');
var events = require('events');
var dgram = require('dgram');

var networkMessages = require('./networkMessages');

function Circuit (hostIP, hostPort, circuitCode) {
  this.ip = hostIP;
  this.port = hostPort;
  this.circuitCode = circuitCode;
  // sequenceNumber is the id of a packet. It will be increased for every packed
  this.sequenceNumber = 0;
  this.senderSequenceNumber = 0;
  var self = this;
  this.socket = dgram.createSocket('udp4', function socketIn (msg, rinfo) {
    // extract the flags
    var flags = msg.readUInt8(0);
    var flagCheck = function (bit) {
      var is = flags >= bit;
      if (is) {
        flags -= bit;
      }
    };
    var isZeroEncoded = flagCheck(128);
    var isReliable = flagCheck(64);
    var isResent = flagCheck(32);
    var hasAck = flagCheck(16);

    var senderSequenceNumber = msg.readUInt32BE(1);
    self.senderSequenceNumber = senderSequenceNumber;

    var bodyStart = msg.readUInt8(5) + 6;

    var msgBody = msg.slice(bodyStart);

    if (isZeroEncoded) {
      msgBody = zero_decode(msgBody);
    }

    var parsedBody = networkMessages.parseBody(msgBody);

    var acks;
    if (hasAck) {
      acks = extractAcks(msg);
    } else {
      acks = [];
    }

    var toEmitObj = {
      isZeroEncoded: isZeroEncoded,
      isReliable: isReliable,
      isResent: isResent,
      body: parsedBody,
      hasAck: hasAck,
      acks: acks
    };
    self.emit(parsedBody.name, toEmitObj);
    self.emit('packetReceived', toEmitObj); // for debugging
  });
  this.socket.bind();
  this.acks = [];
}
util.inherits(Circuit, events.EventEmitter);

// Send a Packet.
// Uses networkMessages to construct the body
// messageType must be a string matching one of the names of message templates
// http://secondlife.com/app/message_template/master_message_template.msg
Circuit.prototype.send = function (messageType, data) {
  // if no message with the type of messageType exist, than createBody will
  // throw an error
  var body = networkMessages.createBody(messageType, data);

  // http://wiki.secondlife.com/wiki/Packet_Layout
  var header = new Buffer(6);
  header.writeUInt8(0, 0); // Buffer doesn't start with 0s
  header.writeUInt32BE(this.sequenceNumber, 1);
  this.sequenceNumber++;
  if (this.sequenceNumber > 4294967295) {
    this.sequenceNumber = 0;
  }
  header.writeUInt8(0, 5);

  // Set header byte 0 flags

  if (body.needsZeroencode) {
    header.writeUInt8(header.readUInt8(0) + 128, 0); // LL_ZERO_CODE_FLAG 0x80
    body.buffer = zero_encode(body.buffer);
  }

  var acksBuffer;
  if (this.acks.length > 0) {
    header.writeUInt8(header.readUInt8(0) + 16, 0); // LL_ACK_FLAG 0x10
    acksBuffer = createAcksBuffer(this.acks);
    this.acks = [];
  } else {
    acksBuffer = new Buffer(0);
  }

  var packet = Buffer.concat([header, body.buffer, acksBuffer]);

  this.socket.send(packet, 0, packet.length, this.port, this.ip);
};

// 0's in packet body are run length encoded, such that series of 1 to 255 zero
// bytes are encoded to take 2 bytes.
function zero_encode (inputbuf) {
  var data = [];
  var zero = false;
  var zero_count = 0;

  for (var i = 0; i < inputbuf.length; i++) {
    var byte = inputbuf.readUInt8(i);
    if (byte !== 0) {
      if (zero_count !== 0) {
        data.push(zero_count);
        zero_count = 0;
        zero = false;
      }
      data.push(byte);
    } else {
      if (zero === false) {
        data.push(byte);
        zero = true;
      }
      zero_count++;
    }
  }
  if (zero_count !== 0) {
    data.push(zero_count);
  }
  return new Buffer(data);
}

// decodes zeroencoded bodies
function zero_decode (inputbuf) {
  var data = [];
  var in_zero = false;

  for (var i = 0; i < inputbuf.length; i++) {
    var byte = inputbuf.readUInt8(i);
    if (byte !== 0) {
      if (in_zero === true) {
        var zero_count = byte - 1;
        while (zero_count > 0) {
          data.push(0);
          zero_count--;
        }
        in_zero = false;
      } else {
        data.push(byte);
      }
    } else {
      data.push(byte);
      in_zero = true;
    }
  }
  return new Buffer(data);
}

// Adds the Acks
function createAcksBuffer (acks) {
  var acksBuffer = new Buffer(acks.length * 4 + 1);
  acks.forEach(function (ack, i) {
    ack = +ack; // to Number
    if (Number.isNaN(ack)) {
      ack = 0;
    }
    acksBuffer.writeUInt32LE(ack, i * 4);
  });
  acksBuffer.writeUInt8(acks.length, acksBuffer.length - 1);
  return acksBuffer;
}

// Extracts the Acks
// for what acks are used is unknown to me
function extractAcks (msg) {
  var offset = msg.length - 1; // in the last byte is the number of acks stored
  var acks = [];
  // it reads the acks backwards
  for (var count = msg.readUInt8(offset); count > 0; count--) {
    offset -= 4;
    acks.push(msg.readUInt32LE(offset));
  }
  acks.reverse();
  return acks;
}

module.exports = Circuit;
