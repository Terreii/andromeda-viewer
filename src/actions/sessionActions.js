import crypto from 'crypto'
import ms from 'milliseconds'
import { v4 as uuid } from 'uuid'

import { viewerName, viewerVersion, viewerPlatform, viewerPlatformVersion } from '../viewerInfo'
import { getValueOf, getStringValueOf } from '../network/msgGetters'

import { saveAvatar, saveGrid } from './viewerAccount'
import {
  getLocalChatHistory,
  loadIMChats,
  deleteOldLocalChat,
  retrieveInstantMessages
} from './chatMessageActions'
import { getAllFriendsDisplayNames } from './friendsActions'
import { fetchSeedCapabilities } from './capabilities'
import LLSD from '../llsd'
import connectCircuit from './connectCircuit'

import { selectSavedAvatars, selectSavedGrids } from '../bundles/account'
import {
  startLogin,
  login as loginAction,
  loginFailed,
  startLogout,
  logout as didLogout,
  userWasKicked,

  selectAgentId,
  selectSessionId,
  selectIsLoggedIn
} from '../bundles/session'

// Actions for the session of an avatar

// Logon the user. It will post using fetch to the server.
export function login (avatarName, password, grid, save, isNew) {
  return async (dispatch, getState, extra) => {
    if (selectIsLoggedIn(getState())) throw new Error('There is already an avatar logged in!')

    dispatch(startLogin({
      name: avatarName,
      grid,
      sync: save
    }))

    const hash = crypto.createHash('md5')
    hash.update(password, 'ascii')
    const finalPassword = '$1$' + hash.digest('hex')

    const viewerData = {
      loginUrl: grid.loginURL,
      userId: null
    }

    if (save) {
      const userData = await extra.db.get('_local/account')
      viewerData.userId = userData.accountId
    }

    const circuit = import('../network/circuit')

    const body = grid.isLLSDLogin
      ? await loginWithLLSD(viewerData, avatarName.first, avatarName.last, finalPassword)
      : await loginWithXmlRpc(viewerData, avatarName.first, avatarName.last, finalPassword)

    if (body.login !== 'true') {
      dispatch(loginFailed({ error: body.message }))
      throw new Error(body.message)
    }

    // save grid if it is new (do not save if login did fail)
    const gridExists = selectSavedGrids(getState()).some(savedGrid => savedGrid.name === grid.name)
    if (save && isNew && !gridExists) {
      await dispatch(saveGrid(grid))
    }

    const avatarIdentifier = `${body.agent_id}@${grid.name}`

    const avatarData = save && isNew
      ? await dispatch(saveAvatar(avatarName, body.agent_id, grid.name)) // adding new avatars
      : selectSavedAvatars(getState()).reduce((last, avatar) => { // for saved avatars
        if (last != null) return last

        return avatar.avatarIdentifier === avatarIdentifier
          ? avatar
          : last
      }, null)

    const localChatHistory = !isNew && save
      ? await dispatch(getLocalChatHistory(avatarData.dataSaveId))
      : []

    dispatch(loginAction({
      name: avatarName,
      save,
      avatarIdentifier: avatarData != null ? avatarData.avatarIdentifier : avatarIdentifier,
      dataSaveId: avatarData != null ? avatarData.dataSaveId : uuid(),
      grid,
      uuid: body.agent_id,
      sessionInfo: body,
      localChatHistory
    }))

    dispatch(loadIMChats())

    // Set the active circuit and connect to sim
    dispatch(connectToSim(body, await circuit))

    dispatch(fetchSeedCapabilities(body.seed_capability))
      .then(() => dispatch(getAllFriendsDisplayNames()))

    return body
  }
}

/**
 * Generates the headers send to the Andromeda-Server to proxy it.
 * @param {object} viewerData Object containing viewer related data.
 * @param {string} viewerData.loginUrl Login URL for the grid.
 * @param {string?} viewerData.userId id of a signed in user.
 * @param {boolean?} isLLSD Should it add a LLSD-header?
 */
function createProxyLoginHeaders ({ loginUrl, userId = null }, isLLSD = false) {
  const headers = new window.Headers()
  headers.append('Content-Type', 'application/json')
  headers.append('x-andromeda-login-url', loginUrl)
  headers.append('x-andromeda-login-content-type', isLLSD ? 'llsd' : 'xml-rpc')

  if (userId != null) {
    headers.append('x-andromeda-login-user-id', userId)
  }

  return headers
}

/**
 * Login using XML-RPC.
 * @param {object} viewerData Object containing viewer related data. (grid ...)
 * @param {string} first First name of the avatar.
 * @param {string} last Last name of the avatar.
 * @param {string} password Hashed and salted password.
 * @returns {object} Login response from the grid.
 */
async function loginWithXmlRpc (viewerData, first, last, password) {
  const loginData = {
    first,
    last,
    passwd: password,
    start: 'last',
    channel: viewerName,
    version: viewerVersion,
    platform: viewerPlatform,
    platform_version: viewerPlatformVersion,
    last_exec_event: 0,
    // mac and id0 will be added on the server side
    options: [
      'buddy-list',
      'inventory-root',
      'inventory-skeleton'
    ],
    agree_to_tos: 'true',
    read_critical: 'true'
  }

  const response = await window.fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify(loginData),
    headers: createProxyLoginHeaders(viewerData)
  })

  const data = await response.json()
  data.andromedaSessionId = response.headers.get('x-andromeda-session-id')
  return data
}

/**
 * Login using LLSD (http://wiki.secondlife.com/wiki/LLSD).
 * @param {object} viewerData Object containing viewer related data. (grid ...)
 * @param {string} first First name of the avatar.
 * @param {string} last Last name of the avatar.
 * @param {string} password Hashed and salted password.
 */
async function loginWithLLSD (viewerData, first, last, password) {
  const loginData = {
    first,
    last,
    passwd: password,
    start: 'last',
    channel: viewerName,
    version: viewerVersion,
    platform: viewerPlatform,
    platform_version: viewerPlatformVersion,
    platform_string: window.navigator.userAgent,
    // mac and id0 will be added on the server side
    options: [
      'buddy-list',
      'inventory-root',
      'inventory-skeleton'
    ],
    agree_to_tos: true,
    read_critical: true,
    viewer_digest: '',
    last_exec_event: 0,
    last_exec_duration: 0,
    address_size: 32 // Is os 32 or 64 bit.
  }

  const response = await window.fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify(loginData),
    headers: createProxyLoginHeaders(viewerData, true)
  })
  const body = await response.text()
  const parsed = LLSD.parse(response.headers.get('content-type').split(';')[0], body)

  // for transforming all UUIDs into strings
  const data = JSON.parse(JSON.stringify(parsed))
  data.andromedaSessionId = response.headers.get('x-andromeda-session-id')
  return data
}

// Logout an avatar
export function logout () {
  return (dispatch, getState, extra) => {
    const circuit = extra.circuit
    const activeState = getState()

    if (!selectIsLoggedIn(activeState)) {
      return Promise.reject(new Error("You aren't logged in!"))
    }

    return new Promise((resolve, reject) => {
      circuit.send('LogoutRequest', {
        AgentData: [
          {
            AgentID: selectAgentId(activeState),
            SessionID: selectSessionId(activeState)
          }
        ]
      }, true)
        .catch(reject)

      dispatch(startLogout())

      let isLoggedOut = false
      const logoutHandler = msg => {
        if (isLoggedOut) return

        isLoggedOut = true
        dispatch(afterAvatarSessionEnds())

        dispatch(didLogout())

        resolve()
      }

      circuit.on('packetReceived', console.log)
      circuit.once('LogoutReply', logoutHandler)
      setTimeout(logoutHandler, ms.seconds(30)) // timeout for LogoutReply
    })
  }
}

// Login to a sim. Is called on the login process and sim-change
function connectToSim (sessionInfo, circuit) {
  return async (dispatch, getState, extraArgs) => {
    const Circuit = circuit.default
    const circuitCode = sessionInfo.circuit_code

    const activeCircuit = new Circuit(
      sessionInfo.sim_ip,
      sessionInfo.sim_port,
      circuitCode,
      sessionInfo.andromedaSessionId
    )
    extraArgs.circuit = activeCircuit

    const sessionId = sessionInfo.session_id
    const agentId = sessionInfo.agent_id

    dispatch(connectCircuit()) // Connect message parsing with circuit.

    activeCircuit.on('KickUser', msg => dispatch(getKicked(msg)))

    await activeCircuit.send('UseCircuitCode', {
      CircuitCode: [
        {
          Code: circuitCode,
          SessionID: sessionId,
          ID: agentId
        }
      ]
    }, true)

    await activeCircuit.send('CompleteAgentMovement', {
      AgentData: [
        {
          AgentID: agentId,
          SessionID: sessionId,
          CircuitCode: circuitCode
        }
      ]
    }, true)

    await activeCircuit.send('AgentUpdate', {
      AgentData: [
        {
          AgentID: agentId,
          SessionID: sessionId,
          BodyRotation: [0, 0, 0],
          HeadRotation: [0, 0, 0],
          State: 0,
          CameraCenter: [0, 0, 0],
          CameraAtAxis: [0, 0, 0],
          CameraLeftAxis: [0, 0, 0],
          CameraUpAxis: [0, 0, 0],
          Far: 0,
          ControlFlags: 0,
          Flags: 0
        }
      ]
    }, true)

    activeCircuit.send('UUIDNameRequest', {
      UUIDNameBlock: [
        {
          ID: agentId
        }
      ]
    }, true)

    setTimeout(function () {
      activeCircuit.send('RequestRegionInfo', {
        AgentData: [
          {
            AgentID: agentId,
            SessionID: sessionId
          }
        ]
      }, true)

      dispatch(requestAvatarProperties(agentId))

      dispatch(retrieveInstantMessages())
    }, 100)
  }
}

function getKicked (msg) {
  return (dispatch, getState, extra) => {
    const activeState = getState()
    const agentId = selectAgentId(activeState)
    const sessionId = selectSessionId(activeState)
    const msgAgentId = getValueOf(msg, 'UserInfo', 0, 'AgentID')
    const msgSessionId = getValueOf(msg, 'UserInfo', 0, 'SessionID')

    if (agentId === msgAgentId && sessionId === msgSessionId) {
      dispatch(afterAvatarSessionEnds())

      dispatch(userWasKicked({
        reason: getStringValueOf(msg, 'UserInfo', 0, 'Reason')
      }))
    }
  }
}

// Cleanup thats happens after logout and getting kicked
function afterAvatarSessionEnds () {
  return (dispatch, getState, extra) => {
    extra.circuit.close()
    extra.circuit.removeAllListeners()
    extra.circuit = null

    for (const cb of extra.onAvatarLogout || []) {
      cb()
    }
    extra.onAvatarLogout = []

    return dispatch(deleteOldLocalChat())
  }
}

function requestAvatarProperties (avatarID) {
  return (dispatch, getState, { circuit }) => {
    const activeState = getState()
    const agentID = selectAgentId(activeState)
    const sessionID = selectSessionId(activeState)

    circuit.send('AvatarPropertiesRequest', {
      AgentData: [
        {
          AgentID: agentID,
          SessionID: sessionID,
          AvatarID: avatarID
        }
      ]
    }, true)
  }
}
