'use strict';

var http = require('http');

var mocha = require('mocha');
var describe = mocha.describe;
var it = mocha.it;
var assert = require('assert');

require('../server.js');

describe('server.js', function () {
  this.slow(3000);

  var port = process.env.PORT || 8000;
  var serverUrl = 'http://127.0.0.1:' + port + '/';

  it('should be listening on port ' + port, function (done) {
    setTimeout(function () {
      http.get(serverUrl, function (res) {
        assert.equal(200, res.statusCode);
        assert.equal('text/html', res.headers['content-type']);
        done();
      });
    }, 1000);
  });

  it('should reject request for files in js/', function (done) {
    http.get(serverUrl + 'js/circuit.js', function (res) {
      assert.equal(403, res.statusCode);
      done();
    });
  });
});
