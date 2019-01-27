'use strict'

let storeData = {}

const hoodie = {
  account: {
    on: function () {}
  },

  store: {
    find: function (id) {
      if (Array.isArray(id)) {
        return Promise.all(
          id.map(
            aID => hoodie.store.find(aID).catch(() => ({ status: 404 }))
          )
        )
      }

      const doc = storeData[id]
      if (doc != null) {
        return Promise.resolve(doc)
      }

      const error = new Error('not found')
      error.status = 404
      return Promise.reject(error)
    },

    updateOrAdd: function (doc) {
      const newDoc = Object.assign(storeData[doc._id] || {}, doc)
      storeData[doc._id] = newDoc
      return Promise.resolve(newDoc)
    },

    pull: function (ids) {
      return Promise.all(ids.map(id => hoodie.store.find(id))).catch(() => [])
    },

    on: function () {},
    off: function () {},
    one: function () {}
  }
}

test('import is a function that adds the cryptoStore to hoodie', () => {
  expect(hoodie.cryptoStore).toBeUndefined()

  require('hoodie-plugin-store-crypto')(hoodie)

  expect(hoodie.cryptoStore).toBeTruthy()
})

test('cryptoStore and its methods exists', () => {
  expect(typeof hoodie.cryptoStore).toBe('object')

  expect(typeof hoodie.cryptoStore.setup).toBe('function')
  expect(typeof hoodie.cryptoStore.unlock).toBe('function')
  expect(typeof hoodie.cryptoStore.changePassword).toBe('function')

  expect(typeof hoodie.cryptoStore.add).toBe('function')
  expect(typeof hoodie.cryptoStore.find).toBe('function')
  expect(typeof hoodie.cryptoStore.findOrAdd).toBe('function')
  expect(typeof hoodie.cryptoStore.findAll).toBe('function')
  expect(typeof hoodie.cryptoStore.update).toBe('function')
  expect(typeof hoodie.cryptoStore.updateOrAdd).toBe('function')
  expect(typeof hoodie.cryptoStore.updateAll).toBe('function')
  expect(typeof hoodie.cryptoStore.remove).toBe('function')
  expect(typeof hoodie.cryptoStore.removeAll).toBe('function')

  expect(typeof hoodie.cryptoStore.on).toBe('function')
  expect(typeof hoodie.cryptoStore.off).toBe('function')
  expect(typeof hoodie.cryptoStore.one).toBe('function')

  expect(typeof hoodie.cryptoStore.withIdPrefix).toBe('function')
  expect(typeof hoodie.cryptoStore.withPassword).toBe('function')
})

test('cryptoStore requires to be unlocked', async () => {
  await hoodie.cryptoStore.setup('test')
  await hoodie.cryptoStore.unlock('test')
})

test('cryptoStore encrypts documents', async () => {
  let unencrypted = null
  let callCount = 0
  let date = null

  hoodie.store.add = function (doc) {
    callCount += 1
    unencrypted = doc

    const result = Object.assign({}, doc, {
      hoodie: {
        created: new Date().toJSON()
      }
    })
    date = result.hoodie.created

    return Promise.resolve(result)
  }

  const result = await hoodie.cryptoStore.add({
    test: 'object',
    value: 2
  })

  expect(result.test).toBe('object')
  expect(result.value).toBe(2)
  expect(typeof result._id).toBe('string')
  expect(typeof result._rev).toBe('string')
  expect(result.hoodie.created).toBe(date)

  expect(callCount).toBe(1)
  expect(unencrypted._id).toBe(result._id)
  expect(typeof unencrypted.data).toBe('string')
  expect(typeof unencrypted.nonce).toBe('string')
  expect(typeof unencrypted.tag).toBe('string')

  expect(unencrypted.test).toBeUndefined()
  expect(unencrypted.value).toBeUndefined()
})
