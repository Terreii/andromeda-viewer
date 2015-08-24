'use strict';

var describe = require('mocha').describe;
var it = require('mocha').it;
var assert = require('assert');

var viewerInfo = require('../js/viewerInfo');

describe('viewerInfo', function () {

  it('should have the viewer name', function () {
    assert.equal('andromeda-viewer', viewerInfo.name);
  });

  it('should have the platform', function () {
    assert.equal(true, /^(Mac|Win|Lin)$/.test(viewerInfo.platform));
  });
});
