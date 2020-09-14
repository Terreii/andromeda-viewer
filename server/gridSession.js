'use strict'

module.exports = init

const pouchdbErrors = require('pouchdb-errors')
const uuid = require('uuid').v4

/**
 * Setup the Grid session methods.
 * @param {import('express').Application} app
 */
function init (app) {
  // Stores the active session ids and their state.
  // The state can be:
  // - {number} Date.now() of when the last activity.
  // - 'active' when there is an open WebSocket connection.
  //
  // When the user logs in the session will be generated and the date will be stored.
  // If the user then connects, before the timeout, then the state will be switched to 'active'.
  // When a WebSocket disconnects, then the time of disconnect will be stored.
  // And after a timeout the session will be deleted.
  const sessions = new Map()
  app.set('gridSessions', sessions)

  app.set('generateSession', generate.bind(null, app))
  app.set('checkSession', check.bind(null, app))
  app.set('changeSessionState', change.bind(null, app))

  setInterval(() => {
    const timeout = Date.now() - (10 * 60 * 1000) // 10 min
    const toRemove = []

    for (const [id, state] of sessions.entries()) {
      if (typeof state === 'number' && state < timeout) {
        toRemove.push(id)
      }
    }

    if (toRemove.length > 0) {
      process.nextTick(() => {
        for (const id of toRemove) {
          sessions.delete(id)
        }
      })
    }
  }, 10000) // every 10s
}

/**
 * Generates a new session UUID.
 * @param {import('express').Application} app  Express Server App
 * @returns {string} A new session UUID.
 */
function generate (app) {
  const id = uuid()
  const sessions = app.get('gridSessions')
  sessions.set(id, Date.now())
  return id
}

/**
 * Check if the session is active.
 * @param {import('express').Application} app  Express Server App
 * @param {string}   id   UUID of the session.
 * @returns {number | 'active'} State of the session. Number = timeout & no active connection.
 */
function check (app, id) {
  const sessions = app.get('gridSessions')

  if (sessions.has(id)) {
    return sessions.get(id)
  } else {
    throw pouchdbErrors.createError(pouchdbErrors.FORBIDDEN, '"x-andromeda-session-id" is wrong')
  }
}

/**
 * Change the session state
 * @param {import('express').Application} app  Express Server App
 * @param {string}                id     UUID of the session
 * @param {'active'|'end'|number} state  Session is active (has a connection) or time of inactive
 * @returns {'active'|'end'|number}      The next state.
 */
function change (app, id, state) {
  const sessions = app.get('gridSessions')

  if (!sessions.has(id)) {
    throw pouchdbErrors.createError(pouchdbErrors.FORBIDDEN, '"x-andromeda-session-id" is wrong')
  }

  if (state === 'end') {
    sessions.delete(id)
    return 'end'
  }

  if (state === 'active' || typeof state === 'number') {
    sessions.set(id, state)
    return state
  }

  throw pouchdbErrors.createError(pouchdbErrors.INVALID_REQUEST, `bad state "${state}"`)
}
