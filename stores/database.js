'use strict'

const hoodie = window.hoodie

let isLoggedInToHoodie = false

hoodie.account.get('session').then(session => {
  if (session) {
    // user is signed in
    isLoggedInToHoodie = true
  } else {
    // user is signed out
    isLoggedInToHoodie = false
  }
  hoodie.account.on('signin', () => {
    isLoggedInToHoodie = true
  })
  hoodie.account.on('signout', () => {
    isLoggedInToHoodie = false
  })
})

// Get all Accounts. Returns a Promise
export function getAccounts () {
  return Promise.resolve({
    accounts: []
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
  }).then(() => {
    return true
  })
}

export function getLocalChatHistory (accountName) {
  if (!isLoggedInToHoodie) {
    return Promise.resolve([])
  }
  const id = accountName.toString() + '_localChat'
  return hoodie.store.findAll({
    startkey: id + '_9',
    endkey: id,
    limit: 100,
    descending: true,
    include_docs: true
  }).then(response => {
    return response.rows.map(row => Object.assign({}, row.doc, {
      time: new Date(row.doc.time)
    }))
  }).catch(err => {
    if (err.name === 'not_found') {
      return []
    } else {
      throw err
    }
  })
}

export function updateLocalChatHistory (accountName, message) {
  const id = accountName.toString().trim() + '_localChat_' + new Date().toJSON()
  const doc = Object.assign({}, message, {
    _id: id,
    time: message.time.toJSON()
  })
  hoodie.store.add(doc)
}
