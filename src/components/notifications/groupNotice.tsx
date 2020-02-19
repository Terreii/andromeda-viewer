import React from 'react'

import { Container } from './utils'
import Text from '../text'

import { useName, useGroupName } from '../../hooks/names'

import { GroupNoticeNotification } from '../../types/chat'
import { AssetType, getItemTypeName } from '../../types/inventory'

import formStyles from '../formElements.module.css'
import styles from './notifications.module.css'

interface NotificationArgs {
  data: GroupNoticeNotification
  onAccept: (
    fromId: string,
    transactionId: string,
    assetType: AssetType,
    isFromGroup: boolean
  ) => void
  onDecline: (
    fromId: string,
    transactionId: string,
    isFromGroup: boolean
  ) => void
  onClose: () => void
}

export default function GroupNotice ({ data, onAccept, onDecline, onClose }: NotificationArgs) {
  const name = useName(data.senderId) || ''
  const groupName = useGroupName(data.groupId)

  return <Container title={`Group Notice from ${groupName} - ${data.title}`}>
    <small>send by {name.toString()}</small>

    <p>
      <Text text={data.text} multiline />
    </p>

    {data.item && <div>
      This notice includes item
      <b> "{data.item!.name}" </b>
      of type
      <b> {getItemTypeName(data.item!.type)}</b>
    </div>}

    <div className={styles.ButtonsRow}>
      {data.item && <button
        className={formStyles.OkButton}
        onClick={() => {
          onAccept(data.senderId, data.item!.transactionId, data.item!.type, true)
          onClose()
        }}
      >
        Save item
      </button>}

      {data.item && <button
        className={formStyles.DangerButton}
        onClick={() => {
          onDecline(data.senderId, data.item!.transactionId, true)
          onClose()
        }}
      >
        Decline item
      </button>}

      {!data.item && <button
        className={formStyles.PrimaryButton}
        onClick={onClose}
      >
        OK
      </button>}
    </div>
  </Container>
}
