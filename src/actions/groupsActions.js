// All group related actions
import { chatSessionStarted } from '../reducers/groups'
import { selectOwnAvatarName } from '../reducers/names'
import { selectPosition } from '../reducers/region'
import { selectAgentId, selectSessionId, selectAvatarDataSaveId } from '../reducers/session'

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
    const agentName = selectOwnAvatarName(activeState).getFullName()
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
          FromAgentName: selectOwnAvatarName(activeState).getFullName()
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
          FromAgentName: selectOwnAvatarName(activeState).getFullName()
        }
      ]
    }, true)
  }
}
