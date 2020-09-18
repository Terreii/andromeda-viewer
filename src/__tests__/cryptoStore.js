'use strict'

import PouchDB from 'pouchdb-browser'
import memoryAdapter from 'pouchdb-adapter-memory'
import hoodieAPI from 'pouchdb-hoodie-api'
import CryptoStore from 'hoodie-plugin-store-crypto'

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

  try {
    await cryptoStore.add({ test: '' })
    throw new Error('should have thrown')
  } catch (err) {
    expect(err.status).toBe(401)
  }

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
