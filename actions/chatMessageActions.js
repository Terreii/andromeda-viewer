'use strict'

/*
 * Sends a message to the server.
 */

import Dispatcher from '../network/uiDispatcher'
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
    getActiveCircuit().send('ImprovedInstantMessage', {
      AgentData: [
        {
          AgentID: getAgentId(),
          SessionID: getSessionId()
        }
      ],
      MessageBlock: [
        {
          FromGroup: false,
          ToAgentID: to,
          ParentEstateID: getParentEstateID(),
          RegionID: getRegionID(),
          Position: getPosition(),
          Offline: 0,
          Dialog: 0,
          ID: id,
          Timestamp: Math.floor(Date.now() / 1000),
          FromAgentName: getAvatarName().getFullName(),
          Message: text,
          BinaryBucket: new Buffer([0])
        }
      ]
    })
    Dispatcher.dispatch({
      type: 'SelfSendImprovedInstantMessage',
      AgentID: getAgentId(),
      SessionID: getSessionId(),
      FromGroup: false,
      ToAgentID: to,
      ParentEstateID: getParentEstateID(),
      RegionID: getRegionID(),
      Position: getPosition(),
      Offline: 0,
      Dialog: 0,
      ID: id,
      Timestamp: Math.floor(Date.now() / 1000),
      FromAgentName: getAvatarName().getFullName(),
      Message: text,
      BinaryBucket: new Buffer([0])
    })
  } catch (e) {
    console.error(e)
  }
}
