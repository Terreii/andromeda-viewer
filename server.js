'use strict';

var http = require('http');
var url = require('url');
var fs = require('fs');
var dgram = require('dgram');

var WebSocketServer = require('websocket').server;
var xmlrpc = require('xmlrpc');

var macaddress;
// the macaddress can be found in node version 0.12 in os.networkInterfaces()
require('macaddress').one(function (error, mac) {
  if (!error) {
    macaddress = mac;
  } else {
    macaddress = '00:00:00:00:00:00';
    console.error('Mac address wasn\'t found!');
  }
});

// SL uses its own tls-certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Web-Server

var server = http.createServer(function (req, res) {
  var reqURL = url.parse(req.url);
  var path = reqURL.pathname;

  if (path === '/login') {
    processLogin(req, res);
  } else {
    returnFile(path, res);
  }
});
server.listen(process.env.PORT || 8000, process.env.IP || '127.0.0.1');

function returnFile (path, res) {
  // no files from the directories js/, node_modules/ or test/ are allowed!
  if (/^\/(?:js)|(?:node_modules)|(?:test)|(?:tools)\//i.test(path)) {
    res.writeHead(403, {'Content-Type': 'text/plain'});
    res.end('403 - Forbidden\n');
    return;
  } else if (path === '/') {
    path = '/index.html';
  } else if (/^\/.+\.js/i.test(path)) {
    // redirection of all js files to jsBuilds/
    path = '/jsBuilds' + path;
  }

  var filePath = '.' + path;

  fs.exists(filePath, function (exists) {
    if (exists) {
      fs.readFile(filePath, function (error, data) {
        if (error) {
          res.writeHead(500, {'Content-Type': 'text/plain'});
          res.end(error.name + ': ' + error.message + '\n');
          return;
        }

        var contentType = 'text/plain';
        if (/.html$/i.test(filePath)) {
          contentType = 'text/html';
        } else if (/.css$/i.test(filePath)) {
          contentType = 'text/css';
        } else if (/.js$/i.test(filePath)) {
          contentType = 'text/javascript';
        } else if (/favicon.ico/i.test(filePath)) {
          // or PNG
          contentType = 'image/x-icon';
        }

        res.writeHead(200, {'Content-Type': contentType});
        res.end(data);
      });
    } else {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('404 - Not Found\n');
    }
  });
}

console.log('Andromeda is running!\nAt: http://' +
  (process.env.IP || '127.0.0.1') + ':' + (process.env.PORT || 8000) +
  '\nNot ready for production!\n');

// Websocket bridge from client to sim

var wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

function websocketOriginIsAllowed (origin) {
  // put logic here to detect whether the specified origin is allowed.
  // for development everytime true
  return true;
}

wsServer.on('request', function (request) {
  if (!websocketOriginIsAllowed(request.origin)) {
    request.reject();
  }
  var connection = request.accept(null, request.origin);
  allBridge.push(new Bridge(connection));
});

var allBridge = []; // all Bridges will be stored here.
// if a brige closes, it will search itself in here and delete itself.

// The Bridge stores the websocket to the client and the UDP-socket to the sim
// the first 6 bytes of a message, between this server and a client, is the
// IP and Port of the sim
function Bridge (wsConnection) {
  this.websocket = wsConnection;
  this.udp = dgram.createSocket('udp4');
  this.udp.bind();

  var self = this;

  // from client to sim
  this.websocket.on('message', function (message) {
    if (message.type === 'binary') {
      var buffy = message.binaryData;

      var ip = buffy.readUInt8(0) + '.' +
        buffy.readUInt8(1) + '.' +
        buffy.readUInt8(2) + '.' +
        buffy.readUInt8(3);

      var slayer = buffy.slice(6);
      self.udp.send(slayer, 0, slayer.length, buffy.readUInt16LE(4), ip);
    }
  });
  this.websocket.on('close', function (message) {
    if (self.udp) {
      self.udp.close();
      self.closeConnetion();
    }
  });

  // from sim to client
  this.udp.on('message', function (message, rinfo) {
    var buffy = Buffer.concat([
      new Buffer(6),
      message
    ]);
    // add IP address
    var ipParts = rinfo.split('.');
    for (var i = 0; i < 4; i++) {
      buffy.writeUInt8(Number(ipParts[i]), i);
    }
    // add port
    buffy.writeUInt16LE(rinfo.port, 4);

    self.websocket.sendBytes(buffy);
  });
  this.udp.on('close', function (message) {
    if (self.websocket) {
      self.websocket.close();
      self.closeConnetion();
    }
  });
}
// delete the upd and websockets and finds the bridge and also deletes it
Bridge.prototype.closeConnetion = function () {
  var pos = allBridge.indexOf(this);
  allBridge.splice(pos, 1);
  this.udp = undefined;
  this.websocket = undefined;
};

function processLogin (req, res) {
  var xmlrpcClient = xmlrpc.createSecureClient({
    host: 'login.agni.lindenlab.com',
    port: 443,
    path: '/cgi-bin/login.cgi'
  });

  var body = '';
  req.on('data', function (data) {
    body += data;
  });
  req.on('end', function (data) {
    if (data) {
      body += data;
    }
    try {
      var reqData = JSON.parse(body);
      reqData.mac = macaddress;

      xmlrpcClient.methodCall('login_to_simulator', [reqData],
          function (err, data) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        if (err) {
          res.end(JSON.stringify(err));
        } else {
          res.end(JSON.stringify(data));
        }
      });
    } catch (error) {
      res.end(400, {'Content-Type': 'text/plain'});
      res.end('Bad Request');
    }
  });
}
