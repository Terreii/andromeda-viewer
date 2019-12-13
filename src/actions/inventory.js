// For inventory actions

import { UUID as LLUUID } from '../llsd'

import { selectFolderForAssetType } from '../reducers/inventory'
import { selectOwnAvatarName } from '../reducers/names'
import { getAgentId, getSessionId } from '../selectors/session'

import { IMDialog } from '../types/chat'
import { AssetType } from '../types/inventory'

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
    if (isFromGroup) {
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
      const folder = selectFolderForAssetType(activeState, assetType)
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
          FromAgentName: selectOwnAvatarName(activeState).getFullName(),
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

/**
 * Accept an inventory offer.
 * @param {string} targetId Id of the offer sender.
 * @param {string} transactionId Id of the transaction.
 * @param {AssetType} assetType Type of the asset.
 * @param {boolean} isFromGroup Is the offer from a group notice?
 * @param {boolean} isFromObject Is the offer from an object?
 */
export const acceptInventoryOffer = (
  targetId,
  transactionId,
  assetType = AssetType.Unknown,
  isFromGroup = false,
  isFromObject = false
) => handleInventoryOffer(true, targetId, transactionId, assetType, isFromGroup, isFromObject)

/**
 * Decline an inventory offer.
 * @param {string} targetId Id of the offer sender.
 * @param {string} transactionId Id of the transaction.
 * @param {boolean} isFromGroup Is the offer from a group notice?
 * @param {boolean} isFromObject Is the offer from an object?
 */
export const declineInventoryOffer = (
  targetId,
  transactionId,
  isFromGroup = false,
  isFromObject = false
) => handleInventoryOffer(false, targetId, transactionId, undefined, isFromGroup, isFromObject)
