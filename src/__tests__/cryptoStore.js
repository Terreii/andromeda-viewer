import nativeCrypto from 'crypto'

import PouchDB from 'pouchdb-browser'
import memoryAdapter from 'pouchdb-adapter-memory'
import hoodieAPI from 'pouchdb-hoodie-api'
import CryptoStore from 'hoodie-plugin-store-crypto'
import msrCrypto from 'hoodie-plugin-store-crypto/lib/utils/msrcrypto'

const webHashToNode = {
  'SHA-256': 'sha256'
}

window.crypto = {
  ...msrCrypto,
  subtle: {
    ...msrCrypto.subtle,

    async importKey (format, keyData, algorithm, extractable, keyUsages) {
      if (format !== 'raw') {
        throw new TypeError('format must be raw')
      }

      if (algorithm.name === 'PBKDF2') {
        if (extractable) {
          throw new TypeError('extractable must be false')
        }
        return {
          type: 'key',
          keyData,
          algorithm: algorithm.name,
          extractable,
          keyUsages
        }
      } else if (algorithm.name === 'AES-GCM') {
        return msrCrypto.subtle.importKey(format, keyData, algorithm, extractable, keyUsages)
      }
    },

    deriveBits (algorithm, baseKey, length) {
      if (algorithm.name !== baseKey.algorithm) {
        return Promise.reject(new TypeError('Algorithm missmatch'))
      }
      const digest = webHashToNode[algorithm.hash.name]
      const salt = algorithm.salt
      const iterations = algorithm.iterations
      const len = length >> 3

      return new Promise((resolve, reject) => {
        nativeCrypto.pbkdf2(baseKey.keyData, salt, iterations, len, digest, (err, derivedKey) => {
          if (err) {
            reject(err)
          } else {
            resolve(derivedKey)
          }
        })
      })
    }
  }
}

PouchDB.plugin(memoryAdapter)
PouchDB.plugin(hoodieAPI)

let db

beforeEach(() => {
  db = new PouchDB('test', { adapter: 'memory' })
})

afterEach(async () => {
  await db.destroy()
})

test('cryptoStore and its methods exists', () => {
  const cryptoStore = new CryptoStore(db.hoodieApi())

  expect(typeof cryptoStore).toBe('object')

  expect(typeof cryptoStore.setup).toBe('function')
  expect(typeof cryptoStore.unlock).toBe('function')
  expect(typeof cryptoStore.changePassword).toBe('function')

  expect(typeof cryptoStore.add).toBe('function')
  expect(typeof cryptoStore.find).toBe('function')
  expect(typeof cryptoStore.findOrAdd).toBe('function')
  expect(typeof cryptoStore.findAll).toBe('function')
  expect(typeof cryptoStore.update).toBe('function')
  expect(typeof cryptoStore.updateOrAdd).toBe('function')
  expect(typeof cryptoStore.updateAll).toBe('function')
  expect(typeof cryptoStore.remove).toBe('function')
  expect(typeof cryptoStore.removeAll).toBe('function')

  expect(typeof cryptoStore.on).toBe('function')
  expect(typeof cryptoStore.off).toBe('function')
  expect(typeof cryptoStore.one).toBe('function')

  expect(typeof cryptoStore.withIdPrefix).toBe('function')
  expect(typeof cryptoStore.withPassword).toBe('function')
})

test('cryptoStore requires to be unlocked', async () => {
  const cryptoStore = new CryptoStore(db.hoodieApi())

  await expect(cryptoStore.add({ test: '' })).rejects.toThrow('Name or password is incorrect.')

  await cryptoStore.setup('testPassword')
  await cryptoStore.unlock('testPassword')

  const added = await cryptoStore.add({ test: 'test' })
  expect(added).toEqual({
    _id: expect.any(String),
    _rev: expect.any(String),
    hoodie: {
      createdAt: expect.any(String)
    },
    test: 'test'
  })
})

test('cryptoStore encrypts documents', async () => {
  const cryptoStore = new CryptoStore(db.hoodieApi())

  await cryptoStore.setup('testPassword')
  await cryptoStore.unlock('testPassword')

  const result = await cryptoStore.add({
    test: 'object',
    value: 2
  })

  expect(result).toEqual({
    _id: expect.any(String),
    _rev: expect.any(String),
    hoodie: {
      createdAt: expect.any(String)
    },
    test: 'object',
    value: 2
  })

  const doc = await db.get(result._id)
  expect(doc).toEqual({
    _id: expect.any(String),
    _rev: expect.any(String),
    hoodie: {
      createdAt: expect.any(String)
    },
    data: expect.any(String),
    nonce: expect.any(String),
    tag: expect.any(String)
  })
})
