import React from 'react'

import { Container, Text } from './utils'

import { InventoryOfferedNotification } from '../../types/chat'
import { AssetType, getItemTypeName } from '../../types/inventory'

import formStyles from '../formElements.module.css'
import styles from './notifications.module.css'

interface NotificationArgs {
  data: InventoryOfferedNotification
  onAccept: (
    fromId: string,
    transactionId: string,
    assetType: AssetType,
    isFromGroup: boolean,
    isFromObject: boolean
  ) => void
  onDecline: (
    fromId: string,
    transactionId: string,
    isFromGroup: boolean,
    isFromObject: boolean
  ) => void
  onClose: () => void
}

export default function InventoryOffer ({ data, onAccept, onDecline, onClose }: NotificationArgs) {
  const doAccept = () => {
    onAccept(data.fromId, data.item.transactionId, data.item.type, false, data.fromObject)
    onClose()
  }
  const doDecline = () => {
    onDecline(data.fromId, data.item.transactionId, false, data.fromObject)
    onClose()
  }

  const itemTypeName = getItemTypeName(data.item.type)
  const a = ['a', 'e', 'i', 'o', 'u'].includes(itemTypeName.charAt(0).toLowerCase()) ? 'an' : 'a'

  return <Container
    title={`${data.fromName} did offer you ${a} ${itemTypeName} item.`}
  >
    <Text text={data.text} />

    <div className={styles.ButtonsRow}>
      <button className={formStyles.OkButton} onClick={doAccept}>
        Accept
      </button>

      <button className={formStyles.DangerButton} onClick={doDecline}>
        Decline
      </button>
    </div>
  </Container>
}
