'use strict';

var http = require('http');
var url = require('url');
var fs = require('fs');

// SL uses its own tls-certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Web-Server

http.createServer(function (req, res) {
  var reqURL = url.parse(req.url);
  var path = reqURL.pathname;

  // no files from the directories js/, node_modules/ or test/ are allowed!
  if (/(?:\/js)|(?:node_modules)|(?:test)/i.test(path)) {
    res.writeHead(403, {'Content-Type': 'text/plain'});
    res.end('403 - Forbidden\n');
    return;
  }

  if (path === '/') {
    path = '/index.html';
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
}).listen(process.env.PORT || 8000, process.env.IP || '127.0.0.1');

console.log('Andromeda is running!\nAt: http://' +
  (process.env.IP || '127.0.0.1') + ':' + (process.env.PORT || 8000) +
  '\nNot ready for production!\n');
