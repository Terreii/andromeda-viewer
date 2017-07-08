'use strict'

/*
 * Sends a message to the server.
 */

import State from '../stores/state'
import {
  getAgentId,
  getActiveCircuit,
  getSessionId,
  getParentEstateID,
  getRegionID,
  getPosition,
  getAvatarName
} from '../session'

export function sendLocalChatMessage (text, type, channel) {
  // Sends messages from the localchat
  // No UI update, because the server/sim will send it
  getActiveCircuit().send('ChatFromViewer', {
    AgentData: [
      {
        AgentID: getAgentId(),
        SessionID: getSessionId()
      }
    ],
    ChatData: [
      {
        Message: text,
        Type: type,
        Channel: channel
      }
    ]
  })
}

export function sendInstantMessage (text, to, id) {
  try {
    const agentID = getAgentId()
    const sessionID = getSessionId()
    const parentEstateID = getParentEstateID()
    const regionID = getRegionID()
    const position = getPosition()
    const fromAgentName = getAvatarName().getFullName()
    const binaryBucket = Buffer.from([0])
    getActiveCircuit().send('ImprovedInstantMessage', {
      AgentData: [
        {
          AgentID: agentID,
          SessionID: sessionID
        }
      ],
      MessageBlock: [
        {
          FromGroup: false,
          ToAgentID: to,
          ParentEstateID: parentEstateID,
          RegionID: regionID,
          Position: position,
          Offline: 0,
          Dialog: 0,
          ID: id,
          Timestamp: Math.floor(Date.now() / 1000),
          FromAgentName: fromAgentName,
          Message: text,
          BinaryBucket: binaryBucket
        }
      ]
    })
    State.dispatch({
      type: 'SelfSendImprovedInstantMessage',
      msg: {
        sessionID,
        fromId: agentID,
        fromGroup: false,
        toAgentID: to,
        parentEstateID,
        regionID,
        position,
        offline: 0,
        dialog: 0,
        id,
        fromAgentName,
        message: text,
        binaryBucket,
        time: Date.now()
      }
    })
  } catch (e) {
    console.error(e)
  }
}

export function getLocalChatHistory (avatarName) {
  return (dispatch, getState, hoodie) => {
    return hoodie.store.withIdPrefix(`${avatarName}/localchat/`).findAll()
  }
}
