// All group related actions
import { chatSessionStarted } from '../bundles/groups'
import { selectOwnAvatarName, getFullNameString } from '../bundles/names'
import { selectPosition } from '../bundles/region'
import { selectAgentId, selectSessionId, selectAvatarDataSaveId } from '../bundles/session'

import { IMDialog } from '../types/chat'

export function startGroupChat (groups) {
  return (dispatch, getState, { circuit }) => {
    const activeState = getState()

    const AgentData = [
      {
        AgentID: selectAgentId(activeState),
        SessionID: selectSessionId(activeState)
      }
    ]
    const position = selectPosition(activeState)
    const agentName = getFullNameString(selectOwnAvatarName(activeState))
    const time = new Date()

    groups.forEach(group => {
      circuit.send('ImprovedInstantMessage', {
        AgentData,
        MessageBlock: [
          {
            ToAgentID: group.id,
            Position: position,
            Dialog: IMDialog.SessionGroupStart,
            ID: group.id,
            Timestamp: Math.floor(time.getTime() / 1000),
            FromAgentName: agentName
          }
        ]
      }, true)
    })

    dispatch(chatSessionStarted(groups, selectAvatarDataSaveId(activeState)))
  }
}

export function acceptGroupInvitation (transactionId, groupId) {
  return (dispatch, getState, { circuit }) => {
    const activeState = getState()

    circuit.send('ImprovedInstantMessage', {
      AgentData: [
        {
          AgentID: selectAgentId(activeState),
          SessionID: selectSessionId(activeState)
        }
      ],
      MessageBlock: [
        {
          ToAgentID: groupId,
          Dialog: IMDialog.GroupInvitationAccept,
          ID: transactionId,
          Timestamp: Math.floor(Date.now() / 1000),
          FromAgentName: getFullNameString(selectOwnAvatarName(activeState))
        }
      ]
    }, true)
  }
}

export function declineGroupInvitation (transactionId, groupId) {
  return (dispatch, getState, { circuit }) => {
    const activeState = getState()

    circuit.send('ImprovedInstantMessage', {
      AgentData: [
        {
          AgentID: selectAgentId(activeState),
          SessionID: selectSessionId(activeState)
        }
      ],
      MessageBlock: [
        {
          ToAgentID: groupId,
          Dialog: IMDialog.GroupInvitationDecline,
          ID: transactionId,
          Timestamp: Math.floor(Date.now() / 1000),
          FromAgentName: getFullNameString(selectOwnAvatarName(activeState))
        }
      ]
    }, true)
  }
}
