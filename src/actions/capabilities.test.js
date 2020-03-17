import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { fetchSeedCapabilities } from './capabilities'
import capabilities from './capabilities.json'

function getStore ({ fetchLLSD, proxyFetch, state }) {
  const extra = thunk.withExtraArgument({
    fetchLLSD: fetchLLSD || proxyFetch,
    proxyFetch
  })

  const store = configureMockStore([extra])

  return store(state)
}

describe('Capabilities', () => {
  it('fetching capabilities urls', async () => {
    const fetchLLSD = jest.fn(async () => ({
      ok: true,
      llsd: async () => [1, 2, 3]
    }))

    const store = getStore({
      fetchLLSD,
      state: {
        session: {
          avatarIdentifier: '987654321'
        },
        region: {
          sim: {
            eventQueueGetUrl: 'test'
          }
        }
      }
    })

    await store.dispatch(fetchSeedCapabilities('https://test.grid.org/123456789'))

    expect(fetchLLSD.mock.calls.length).toBe(2)
    expect(fetchLLSD.mock.calls[0]).toEqual([
      'https://test.grid.org/123456789',
      {
        method: 'POST',
        body: capabilities
      }
    ])

    expect(fetchLLSD.mock.calls[1]).toEqual([
      'test',
      {
        method: 'POST',
        body: {
          ack: 0,
          done: false
        }
      }
    ])

    expect(store.getActions()).toEqual([
      {
        type: 'SeedCapabilitiesLoaded',
        capabilities: [1, 2, 3]
      }
    ])
  })
})
