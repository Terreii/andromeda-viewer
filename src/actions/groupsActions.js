// All group related actions

import { startNewIMChat } from './chatMessageActions'

export function startGroupChat (groups) {
  return (dispatch, getState, { circuit }) => {
    const activeState = getState()
    const session = activeState.session

    const agentID = session.get('agentId')
    const sessionID = session.get('sessionId')
    const position = session.getIn(['position', 'position'])
    const fromAgentName = activeState.names.getIn(['names', agentID]).getFullName()
    const binaryBucket = Buffer.from([])
    const time = new Date()

    groups.forEach(group => {
      const groupId = group.id
      circuit.send('ImprovedInstantMessage', {
        AgentData: [
          {
            AgentID: agentID,
            SessionID: sessionID
          }
        ],
        MessageBlock: [
          {
            FromGroup: false,
            ToAgentID: groupId,
            ParentEstateID: 0,
            RegionID: '00000000-0000-0000-0000-000000000000',
            Position: position,
            Offline: 0,
            Dialog: 15,
            ID: groupId,
            Timestamp: Math.floor(time.getTime() / 1000),
            FromAgentName: fromAgentName,
            Message: Buffer.from([]),
            BinaryBucket: binaryBucket
          }
        ]
      }, true)

      dispatch(startNewIMChat(15, groupId, group.name))
    })
  }
}
