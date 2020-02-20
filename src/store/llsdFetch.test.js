import { proxyFetch, fetchLLSD } from './llsdFetch'
import LLSD, { UUID } from '../llsd'

describe('proxyFetch', () => {
  it('should make a fetch request to /hoodie/andromeda-viewer/proxy/', async () => {
    const result = { test: 'hello' }
    global.fetch = jest.fn().mockImplementationOnce(async () => result)

    const getState = () => ({
      session: {
        andromedaSessionId: 'test'
      }
    })

    const response = await proxyFetch(getState, 'https://example.com/test')

    expect(response).toBe(result)

    expect(global.fetch.mock.calls.length).toBe(1)
    expect(global.fetch.mock.calls[0]).toEqual([
      'http://localhost/hoodie/andromeda-viewer/proxy/https/example.com/test',
      {
        headers: {
          'x-andromeda-session-id': 'test'
        }
      }
    ])
  })

  it('should use all options for the fetch request', async () => {
    const result = { test: 'hello' }
    global.fetch = jest.fn().mockImplementationOnce(async () => result)

    const getState = () => ({
      session: {
        andromedaSessionId: 'test'
      }
    })

    const response = await proxyFetch(getState, 'https://example.com/test', {
      method: 'POST',
      headers: new window.Headers([['content-type', 'text/plain']]),
      body: 'hello world!'
    })

    expect(response).toBe(result)

    expect(global.fetch.mock.calls.length).toBe(1)
    expect(global.fetch.mock.calls[0]).toEqual([
      'http://localhost/hoodie/andromeda-viewer/proxy/https/example.com/test',
      {
        method: 'POST',
        headers: new window.Headers([
          ['content-type', 'text/plain'],
          ['x-andromeda-session-id', 'test']
        ]),
        body: 'hello world!'
      }
    ])
  })

  it('should throw when a window.Request is used', () => {
    const getState = () => ({
      session: {
        andromedaSessionId: 'test'
      }
    })

    expect(() => {
      proxyFetch(getState, new window.Request('https://example.com/test'))
    }).toThrowError('Using "Request" is not yet supported!')
  })
})

describe('fetchLLSD', () => {
  it('should add a llsd function to the response', async () => {
    global.fetch = jest.fn().mockImplementationOnce(async () => {
      return new window.Response('<?xml version="1.0" encoding="UTF-8"?><llsd><map>' +
        '<key>region_id</key><uuid>67153d5b-3659-afb4-8510-adda2c034649</uuid>' +
        '<key>scale</key><string>one minute</string><key>simulator statistics</key>' +
        '<map><key>time dilation</key><real>0.9878624</real>' +
        '<key>sim fps</key><real>44.38898</real>' +
        '<key>pysics fps</key><real>44.38906</real>' +
        '<key>agent updates per second</key><real>nan</real>' +
        '<key>lsl instructions per second</key><real>0</real>' +
        '<key>total task count</key><real>4</real>' +
        '<key>active task count</key><real>0</real>' +
        '<key>active script count</key><real>4</real>' +
        '<key>main agent count</key><real>0</real>' +
        '<key>child agent count</key><real>0</real>' +
        '<key>inbound packets per second</key><real>1.228283</real>' +
        '<key>outbound packets per second</key><real>1.277508</real>' +
        '<key>pending downloads</key><real>0</real>' +
        '<key>pending uploads</key><real>0.0001096525</real>' +
        '<key>frame ms</key><real>0.7757886</real>' +
        '<key>net ms</key><real>0.3152919</real>' +
        '<key>sim other ms</key><real>0.1826937</real>' +
        '<key>sim physics ms</key><real>0.04323055</real>' +
        '<key>agent ms</key><real>0.01599029</real>' +
        '<key>image ms</key><real>0.01865955</real>' +
        '<key>script ms</key><real>0.1338836</real>' +
        '</map></map></llsd>', {
        headers: {
          'content-type': LLSD.MIMETYPE_XML
        }
      })
    })

    const getState = () => ({
      session: {
        andromedaSessionId: 'test'
      }
    })

    const response = await fetchLLSD(getState, 'https://example.com/test')

    expect(response).toBeInstanceOf(window.Response)
    expect(typeof response.llsd).toBe('function')

    expect(await response.llsd()).toEqual({
      region_id: new UUID('67153d5b-3659-afb4-8510-adda2c034649'),
      scale: 'one minute',
      'simulator statistics': {
        'active script count': 4,
        'active task count': 0,
        'agent ms': 0.01599029,
        'agent updates per second': undefined,
        'child agent count': 0,
        'frame ms': 0.7757886,
        'image ms': 0.01865955,
        'inbound packets per second': 1.228283,
        'lsl instructions per second': 0,
        'main agent count': 0,
        'net ms': 0.3152919,
        'outbound packets per second': 1.277508,
        'pending downloads': 0,
        'pending uploads': 0.0001096525,
        'pysics fps': 44.38906,
        'script ms': 0.1338836,
        'sim fps': 44.38898,
        'sim other ms': 0.1826937,
        'sim physics ms': 0.04323055,
        'time dilation': 0.9878624,
        'total task count': 4
      }
    })

    expect(global.fetch.mock.calls[0]).toEqual([
      'http://localhost/hoodie/andromeda-viewer/proxy/https/example.com/test',
      {
        headers: {
          'x-andromeda-session-id': 'test'
        }
      }
    ])
  })

  it('should use all options from fetch', async () => {
    global.fetch = jest.fn().mockImplementationOnce(async () => {
      return new window.Response('<?xml version="1.0" encoding="UTF-8"?><llsd><map>' +
        '<key>region_id</key><uuid>67153d5b-3659-afb4-8510-adda2c034649</uuid>' +
        '<key>scale</key><string>one minute</string><key>simulator statistics</key>' +
        '<map><key>time dilation</key><real>0.9878624</real>' +
        '<key>sim fps</key><real>44.38898</real>' +
        '<key>pysics fps</key><real>44.38906</real>' +
        '<key>agent updates per second</key><real>nan</real>' +
        '<key>lsl instructions per second</key><real>0</real>' +
        '<key>total task count</key><real>4</real>' +
        '<key>active task count</key><real>0</real>' +
        '<key>active script count</key><real>4</real>' +
        '<key>main agent count</key><real>0</real>' +
        '<key>child agent count</key><real>0</real>' +
        '<key>inbound packets per second</key><real>1.228283</real>' +
        '<key>outbound packets per second</key><real>1.277508</real>' +
        '<key>pending downloads</key><real>0</real>' +
        '<key>pending uploads</key><real>0.0001096525</real>' +
        '<key>frame ms</key><real>0.7757886</real>' +
        '<key>net ms</key><real>0.3152919</real>' +
        '<key>sim other ms</key><real>0.1826937</real>' +
        '<key>sim physics ms</key><real>0.04323055</real>' +
        '<key>agent ms</key><real>0.01599029</real>' +
        '<key>image ms</key><real>0.01865955</real>' +
        '<key>script ms</key><real>0.1338836</real>' +
        '</map></map></llsd>', {
        headers: {
          'content-type': LLSD.MIMETYPE_XML
        }
      })
    })

    const getState = () => ({
      session: {
        andromedaSessionId: 'test'
      }
    })

    await fetchLLSD(getState, 'https://example.com/test', {
      method: 'POST',
      headers: new window.Headers([['content-type', 'text/plain']]),
      body: {
        hello: 'world!',
        number: 20
      }
    })

    expect(global.fetch.mock.calls[0]).toEqual([
      'http://localhost/hoodie/andromeda-viewer/proxy/https/example.com/test',
      {
        method: 'POST',
        headers: new window.Headers([
          ['content-type', 'application/llsd+xml'],
          ['x-andromeda-session-id', 'test']
        ]),
        body: '<llsd><map><key>hello</key><string>world!</string>' +
          '<key>number</key><integer>20</integer></map></llsd>'
      }
    ])
  })

  it('should throw when a window.Request is used', () => {
    const getState = () => ({
      session: {
        andromedaSessionId: 'test'
      }
    })

    expect(fetchLLSD(getState, new window.Request('https://example.com/test')))
      .rejects.toThrowError('Using "Request" is not yet supported!')
  })
})
