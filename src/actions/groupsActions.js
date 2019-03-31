// All group related actions

import { startNewIMChat } from './chatMessageActions'

import { getAgentId, getSessionId } from '../selectors/session'
import { getAvatarNameById } from '../selectors/names'
import { getPosition } from '../selectors/region'

export function startGroupChat (groups) {
  return (dispatch, getState, { circuit }) => {
    const activeState = getState()

    const agentID = getAgentId(activeState)
    const AgentData = [
      {
        AgentID: agentID,
        SessionID: getSessionId(activeState)
      }
    ]
    const position = getPosition(activeState)
    const agentName = getAvatarNameById(activeState, agentID).getFullName()
    const binaryBucket = Buffer.from([])
    const time = new Date()

    groups.forEach(group => {
      circuit.send('ImprovedInstantMessage', {
        AgentData,
        MessageBlock: [
          {
            FromGroup: false,
            ToAgentID: group.id,
            ParentEstateID: 0,
            RegionID: '00000000-0000-0000-0000-000000000000',
            Position: position,
            Offline: 0,
            Dialog: 15,
            ID: group.id,
            Timestamp: Math.floor(time.getTime() / 1000),
            FromAgentName: agentName,
            Message: Buffer.from([]),
            BinaryBucket: binaryBucket
          }
        ]
      }, true)

      dispatch(startNewIMChat(15, group.id, group.name))
    })

    dispatch({
      type: 'ChatSessionsStarted',
      chatUUIDs: groups.map(group => group.id)
    })
  }
}
