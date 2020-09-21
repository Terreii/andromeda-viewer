'use strict'

module.exports = init

const pouchdbErrors = require('pouchdb-errors')
const ms = require('milliseconds')
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
  const onTimeoutSessionIds = new Set()
  app.set('gridSessions', sessions)
  app.set('gridSessionsIdsOnTimeout', onTimeoutSessionIds)

  app.set('generateSession', generate.bind(null, app))
  app.set('checkSession', check.bind(null, app))
  app.set('changeSessionState', change.bind(null, app))
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
  const timeoutIds = app.get('gridSessionsIdsOnTimeout')

  if (!sessions.has(id)) {
    throw pouchdbErrors.createError(pouchdbErrors.FORBIDDEN, '"x-andromeda-session-id" is wrong')
  }

  // Check if sessions did timeout and remove some of them.
  process.nextTick(() => {
    const timeout = Date.now() - ms.minutes(10)
    const toRemove = []
    for (const sessionId of timeoutIds) {
      if (sessions.get(sessionId) < timeout) {
        toRemove.push(sessionId)
      } else {
        break
      }
    }
    if (toRemove.length > 0) {
      for (const sessionId of toRemove) {
        sessions.delete(sessionId)
        timeoutIds.delete(sessionId)
      }
    }
  })

  const state = sessions.get(id)
  if (typeof state === 'number' && timeoutIds.has(id) && state < (Date.now() - ms.minutes(10))) {
    sessions.delete(id)
    timeoutIds.delete(id)
    throw pouchdbErrors.createError(pouchdbErrors.FORBIDDEN, '"x-andromeda-session-id" is wrong')
  }
  return state
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
  const timeoutIds = app.get('gridSessionsIdsOnTimeout')

  if (!sessions.has(id)) {
    throw pouchdbErrors.createError(pouchdbErrors.FORBIDDEN, '"x-andromeda-session-id" is wrong')
  }

  if (timeoutIds.has(id) && ['end', 'active'].includes(state)) {
    timeoutIds.delete(id)
  }

  if (state === 'end') {
    sessions.delete(id)
    return 'end'
  }

  if (state === 'active' || typeof state === 'number') {
    sessions.set(id, state)

    if (typeof state === 'number') {
      timeoutIds.add(id)
    }

    return state
  }

  throw pouchdbErrors.createError(pouchdbErrors.INVALID_REQUEST, `bad state "${state}"`)
}
