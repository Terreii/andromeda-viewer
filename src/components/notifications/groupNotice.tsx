import React from 'react'

import { Container, Text } from './utils'

import { GroupNoticeNotification } from '../../types/chat'
import { AssetType } from '../../types/inventory'

import formStyles from '../formElements.module.css'
import styles from './notifications.module.css'

interface NotificationArgs {
  data: GroupNoticeNotification
  onAccept: (target: string, transactionId: string, assetType: AssetType) => void
  onDecline: (target: string, transactionId: string) => void
  onClose: () => void
}

function getItemTypeName (type: AssetType): string {
  switch (type) {
    case AssetType.ImageJPEG:
    case AssetType.ImageTGA:
      return 'Image'

    case AssetType.TextureTGA:
      return 'Texture'

    case AssetType.LSLByteCode:
    case AssetType.LSLText:
    case AssetType.ObsoleteScript:
      return 'LSL'

    case AssetType.Sound:
    case AssetType.SoundWAV:
      return 'Sound'
  
    default:
      return AssetType[type]
  }
}

export default function GroupNotice ({ data, onAccept, onDecline, onClose }: NotificationArgs) {
  return <Container title={data.title}>
    <Text text={data.text} />

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
          onAccept(data.senderId, data.item!.transactionId, data.item!.type)
          onClose()
        }}
      >
        Save item
      </button>}

      {data.item && <button
        className={formStyles.DangerButton}
        onClick={() => {
          onDecline(data.senderId, data.item!.transactionId)
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
