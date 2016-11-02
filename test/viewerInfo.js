'use strict'

import {describe, it} from 'mocha'
import assert from 'assert'

import {viewerName, viewerPlatform} from '../viewerInfo'

describe('viewerInfo', () => {
  it('should have the viewer name', function () {
    assert.equal('andromeda-viewer', viewerName)
  })

  it('should have the platform', () => {
    assert.equal(true, /^(Mac|Win|Lin)$/.test(viewerPlatform))
  })
})
