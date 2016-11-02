'use strict'

import PouchDB from 'pouchdb'

const db = new PouchDB('andromeda-db')

// Get all Accounts. Returns a Promise
export function getAccounts () {
  return db.get('accounts').catch(err => {
    if (err.name === 'not_found') {
      return {
        _id: 'accounts',
        accounts: []
      }
    } else {
      throw err
    }
  })
}

// Add a new Account to the database. Returns a Promise
export function addAccount (name, loginURL) {
  return getAccounts().then(accounts => {
    if (!accounts.accounts.some(account => account.name === name)) {
      accounts.accounts.push({
        name,
        url: loginURL
      })
    }
    return accounts
  }).then(accounts => {
    return db.put(accounts)
  }).then(() => {
    return true
  })
}

export function getLocalChat (accountName) {
  const id = accountName.toString() + '_localChat'
  return db.allDocs({
    startkey: id + '_9',
    endkey: id,
    limit: 100,
    descending: true,
    include_docs: true
  }).catch(err => {
    if (err.name === 'not_found') {
      return []
    } else {
      throw err
    }
  })
}

export function updateLocalChat (accountName, message) {
  const id = accountName.toString().trim() + '_localChat_' + new Date().toJSON()
  const doc = Object.assign({
    _id: id
  }, message, {
    time: message.time.toJSON()
  })
  return db.put(doc)
}
