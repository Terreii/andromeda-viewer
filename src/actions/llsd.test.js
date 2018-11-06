import { fetchLLSD } from './llsd'

test('get LLSD', async () => {
  let mimeType = ''

  global.fetch = jest.fn().mockImplementation((url, options) => {
    expect(url).toBe('/hoodie/andromeda-viewer/proxy')
    expect(options.method).toBe('POST')
    expect(options.headers.get('content-type')).toBe('text/plain')
    expect(options.headers.get('x-andromeda-fetch-url')).toBe('/test-url')
    expect(options.headers.get('x-andromeda-fetch-method')).toBe('GET')
    expect(options.headers.get('x-andromeda-fetch-type')).toBe(mimeType)

    return Promise.resolve({
      headers: {
        get: () => 'application/llsd+xml'
      },
      text: () => {
        return '<llsd><map>' +
          '<key>test</key><string>hello world!</string>' +
          '<key>a</key><array><integer>4</integer><boolean>true</boolean></array>' +
          '</map></llsd>'
      }
    })
  })

  mimeType = 'application/llsd+xml'
  expect(await fetchLLSD('GET', '/test-url')).toEqual({
    test: 'hello world!',
    a: [
      4,
      true
    ]
  })

  mimeType = 'application/llsd+json'
  expect(await fetchLLSD('GET', '/test-url', null, 'application/llsd+json')).toEqual({
    test: 'hello world!',
    a: [
      4,
      true
    ]
  })
})

test('POST LLSD', async () => {
  let mimeType = ''

  global.fetch = jest.fn().mockImplementation((url, options) => {
    expect(url).toBe('/hoodie/andromeda-viewer/proxy')
    expect(options.method).toBe('POST')
    expect(options.headers.get('content-type')).toBe('text/plain')
    expect(options.headers.get('x-andromeda-fetch-url')).toBe('/test-url')
    expect(options.headers.get('x-andromeda-fetch-method')).toBe('POST')
    const requestType = options.headers.get('x-andromeda-fetch-type')
    expect(requestType).toBe(mimeType)

    switch (requestType) {
      case 'application/llsd+xml':
        expect(options.body).toBe('<llsd><map>' +
          '<key>ack</key><integer>123</integer>' +
          '<key>done</key><boolean></boolean>' +
          '</map></llsd>')
        break

      case 'application/llsd+json':
        expect(JSON.parse(options.body)).toEqual({
          ack: 123,
          done: false
        })
        break

      case 'application/llsd+binary':
        break

      default:
        throw new Error('unknown mime-type: ' + requestType)
    }

    return Promise.resolve({
      headers: {
        get: () => requestType
      },
      text: () => {
        return options.body
      }
    })
  })

  mimeType = 'application/llsd+xml'
  expect(await fetchLLSD('POST', '/test-url', { ack: 123, done: false })).toEqual({
    ack: 123,
    done: false
  })

  const tests = [
    'application/llsd+xml',
    'application/llsd+json'
    // 'application/llsd+binary' // there seems to be an error in LindenLabs LLSD parser
  ].map(async type => {
    mimeType = type
    expect(await fetchLLSD('POST', '/test-url', { ack: 123, done: false }, type)).toEqual({
      ack: 123,
      done: false
    })
  })

  return Promise.all(tests)
})
