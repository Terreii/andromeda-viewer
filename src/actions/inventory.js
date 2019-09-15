// For inventory actions

import { UUID as LLUUID } from '../llsd'

import { getAgentId, getSessionId } from '../selectors/session'
import { getFolderForAssetType } from '../selectors/inventory'
import { getOwnAvatarName } from '../selectors/names'

import { IMDialog } from '../types/chat'

function handleInventoryOffer (
  isAccept,
  targetId,
  transactionId,
  assetType,
  isFromGroup,
  isFromObject
) {
  return (dispatch, getState, { circuit }) => {
    const activeState = getState()

    let dialog
    if (isFromObject) {
      dialog = isAccept
        ? IMDialog.GroupNoticeInventoryAccepted
        : IMDialog.GroupNoticeInventoryDeclined
    } else if (isFromObject) {
      dialog = isAccept
        ? IMDialog.TaskInventoryAccepted
        : IMDialog.TaskInventoryDeclined
    } else {
      dialog = isAccept
        ? IMDialog.InventoryAccepted
        : IMDialog.InventoryDeclined
    }

    let bucket
    if (isAccept) {
      const folder = getFolderForAssetType(activeState, assetType)
      bucket = new LLUUID(folder.folderId).getOctets()
    } else {
      bucket = []
    }

    circuit.send('ImprovedInstantMessage', {
      AgentData: [
        {
          AgentID: getAgentId(activeState),
          SessionID: getSessionId(activeState)
        }
      ],
      MessageBlock: [
        {
          FromAgentName: getOwnAvatarName(activeState).getFullName(),
          ToAgentID: targetId,
          ID: transactionId,
          Dialog: dialog,
          Timestamp: Math.floor(Date.now() / 1000),
          BinaryBucket: bucket
        }
      ]
    }, true)
  }
}

export const acceptInventoryOffer = (
  targetId,
  transactionId,
  assetType,
  isFromGroup = false,
  isFromObject = false
) => handleInventoryOffer(true, targetId, transactionId, assetType, isFromGroup, isFromObject)

export const declineInventoryOffer = (
  targetId,
  transactionId,
  isFromGroup = false,
  isFromObject = false
) => handleInventoryOffer(false, targetId, transactionId, undefined, isFromGroup, isFromObject)
