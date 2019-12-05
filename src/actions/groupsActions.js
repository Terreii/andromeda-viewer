// All group related actions
import { v4 as uuid } from 'uuid'

import { getAgentId, getSessionId, getAvatarDataSaveId } from '../selectors/session'
import { getOwnAvatarName } from '../selectors/names'
import { selectPosition } from '../reducers/region'

import { IMDialog } from '../types/chat'

export function startGroupChat (groups) {
  return (dispatch, getState, { circuit }) => {
    const activeState = getState()

    const AgentData = [
      {
        AgentID: getAgentId(activeState),
        SessionID: getSessionId(activeState)
      }
    ]
    const position = selectPosition(activeState)
    const agentName = getOwnAvatarName(activeState).getFullName()
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

    dispatch({
      type: 'GROUP_CHAT_SESSIONS_STARTED',
      avatarDataSaveId: getAvatarDataSaveId(activeState),

      groups: groups.reduce((obj, group) => {
        obj[group.id] = {
          id: group.id,
          saveId: uuid(),
          name: group.name
        }
        return obj
      }, {})
    })
  }
}

export function acceptGroupInvitation (transactionId, groupId) {
  return (dispatch, getState, { circuit }) => {
    const activeState = getState()

    circuit.send('ImprovedInstantMessage', {
      AgentData: [
        {
          AgentID: getAgentId(activeState),
          SessionID: getSessionId(activeState)
        }
      ],
      MessageBlock: [
        {
          ToAgentID: groupId,
          Dialog: IMDialog.GroupInvitationAccept,
          ID: transactionId,
          Timestamp: Math.floor(Date.now() / 1000),
          FromAgentName: getOwnAvatarName(activeState).getFullName()
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
          AgentID: getAgentId(activeState),
          SessionID: getSessionId(activeState)
        }
      ],
      MessageBlock: [
        {
          ToAgentID: groupId,
          Dialog: IMDialog.GroupInvitationDecline,
          ID: transactionId,
          Timestamp: Math.floor(Date.now() / 1000),
          FromAgentName: getOwnAvatarName(activeState).getFullName()
        }
      ]
    }, true)
  }
}
