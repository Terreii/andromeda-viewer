'use strict';

/*
 * The circuit is the connection to the sim server
 *
 * Is a EventEmitter
 * emits the event 'packetReceived'
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
  this.socket = dgram.createSocket('udp4', function (msg, rinfo) {
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

    var bodyStart = msg.readUInt8(5) + 5;

    var msgBody = msg.slice(bodyStart);

    if (isZeroEncoded) {
      msgBody = zero_decode(msgBody);
    }

    var parsedBody = networkMessages.parseBody(msgBody);

    var acks = [];
    if (hasAck) {
      acks = extractAcks(msg, bodyStart + parsedBody.size);
    }

    self.emit('packetReceived', {
      isZeroEncoded: isZeroEncoded,
      isReliable: isReliable,
      isResent: isResent,
      hasAck: hasAck,
      body: parsedBody,
      acks: acks
    });
  });
  this.socket.bind();
  this.acks = [];
}
util.inherits(Circuit, events.EventEmitter);

// Send a Packet.
// Uses networkMessages to construct the body
Circuit.prototype.send = function (messageType, body) {
  var type = networkMessages.messageTypes[messageType];
  if (!type) {
    throw new TypeError('No message type with the name: ' + messageType);
  }

  // http://wiki.secondlife.com/wiki/Packet_Layout
  var header = new Buffer(5);

  var bodyBuffer = networkMessages.createBody(messageType, body);

  // Set header byte 0 flags

  if (type.zerocoded) {
    header.writeUInt8(header.readUInt8(0) + 128, 0); // LL_ZERO_CODE_FLAG 0x80
    bodyBuffer = zero_encode(bodyBuffer);
  }

  if (this.acks.length > 0) {
    header.writeUInt8(header.readUInt8(0) + 16, 0); // LL_ACK_FLAG 0x10
    bodyBuffer = addAcks(this.acks, bodyBuffer);
    this.acks = [];
  }

  header.writeUInt32BE(this.sequenceNumber, 1);
  this.sequenceNumber++;
  if (this.sequenceNumber > 4294967295) {
    this.sequenceNumber = 0;
  }

  var packet = Buffer.concat([header, bodyBuffer]);

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

function addAcks (acks, buffer) {
  return buffer;
}

// Extracts the Acks
// for war acks are used is unknown to me
function extractAcks (msg, ackStart) {
  var count = msg.readUInt8(msg.length - 1);
  var acks = [];
  for (var i = 0; i < count; i++) {
    acks.push(msg.readUInt32LE(ackStart + (i * 4)));
  }
  return acks;
}

module.exports = Circuit;
