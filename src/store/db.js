import PouchDB from 'pouchdb-browser'
import memoryAdapter from 'pouchdb-adapter-memory'
import auth from 'pouchdb-authentication'
import hoodieApi from 'pouchdb-hoodie-api'
import hoodiePluginStoreCrypto from 'hoodie-plugin-store-crypto'

PouchDB.plugin(memoryAdapter)
PouchDB.plugin(auth)
PouchDB.plugin(hoodieApi)

export function createLocalDB () {
  return new PouchDB('local')
}

export function createCryptoStore (localDB) {
  const api = localDB.hoodieApi()
  const getter = { store: api }
  hoodiePluginStoreCrypto(getter)
  return getter.cryptoStore
}

export function createRemoteDB (dbName, skipSetup = true) {
  const url = new URL(process.env.REACT_APP_DB_URL || 'http://127.0.0.1:5984')
  url.pathname = '/' + dbName

  console.log(url.href)
  return new PouchDB(url.href, {
    adapter: 'http',
    skip_setup: skipSetup
  })
}

export function startSyncing (localDB, remoteDB) {
  const syncing = localDB.sync(remoteDB, {
    live: true,
    retry: true
  })

  syncing.on('error', console.error)

  PouchDB.on('destroyed', function listener (dbName) {
    if (dbName === localDB.name) {
      PouchDB.off('destroyed', listener)

      syncing.cancel()
    }
  })
}

/**
 * Get the name of the users remote-database.
 * This function uses browser APIs.
 * @param {string} name     - The username.
 * @param {string} [prefix] - Prefix, can be changed with config [couch_peruser] database_prefix
 */
export function getUserDatabaseName (name, prefix = 'userdb-') {
  const encoder = new TextEncoder()
  const buffy = encoder.encode(name)
  const bytes = Array.from(buffy).map(byte =>
    byte.toString(16).padStart(2, '0')
  )
  return prefix + bytes.join('')
}
