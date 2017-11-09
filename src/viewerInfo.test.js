'use strict'

import {viewerName, viewerPlatform} from './viewerInfo'

global.test('should have the viewer name', () => {
  global.expect(viewerName).toBe('andromeda-viewer')
})

global.test('should have the platform', () => {
  global.expect(/^(Mac|Win|Lin)$/.test(viewerPlatform)).toBe(true)
})
